from os import environ
import logging
import requests
import json
import model
import json
import traceback

logging.basicConfig(level="INFO")
logger = logging.getLogger(__name__)

rollup_server = environ["ROLLUP_HTTP_SERVER_URL"]
logger.info(f"HTTP rollup_server url is {rollup_server}")

def emit_notice(data):
    notice_payload = {"payload": data["payload"]}
    response = requests.post(rollup_server + "/notice", json=notice_payload)
    if response.status_code == 201:
        logger.info(f"Notice emitted successfully with data: {data}")
    else:
        logger.error(f"Failed to emit notice with data: {data}. Status code: {response.status_code}")

def hex2str(hex):
    """
    Decodes a hex string into a regular string
    """
    return bytes.fromhex(hex[2:]).decode("utf-8")

def str2hex(str):
    """
    Encodes a string as a hex string
    """
    return "0x" + str.encode("utf-8").hex()


def classify(input): 
    """
    Predicts a given input's classification using the model generated with m2cgen
    """
    # computes the score from the input
    score = model.score(input)

    # interprets the score to retrieve the predicted class index
    class_index = None
    if isinstance(score, list):
        class_index = score.index(max(score))
    else:
        if (score > 0):
            class_index = 1
        else:
            class_index = 0

    # returns the class specified by the predicted index
    return model.classes[class_index]


def format(input):
    """
    Transforms a given input so that it is in the format expected by the m2cgen model
    """
    formatted_input = {}
    for key in input.keys():
        if key in model.columns:
            # key in model: just copy the value
            formatted_input[key] = input[key]
        else:
            # key not in model: it may need to be transformed due to One Hot Encoding
            # - in OHE, there is a column for each possible key/value combination
            # - a OHE column has value 1 if the entry contains the key/value combination
            # - for each key, there is an extra column <key>_nan for unknown values
            ohe_key = key + "_" + str(input[key])
            ohe_key_unknown = key + "_nan"
            if ohe_key in model.columns:
                formatted_input[ohe_key] = 1
            else:
                formatted_input[ohe_key_unknown] = 1

    # builds output as a list/array with one entry for each column in the model
    output = []
    for column in model.columns:
        if column in formatted_input:
            # uses known value for columns present in input
            output.append(formatted_input[column])
        else:
            # uses value 0 for columns not present in the input (all other OHE columns)
            output.append(0)
    return output


def handle_advance(data):
    logger.info(f"Received advance request data {data}")

    status = "accept"
    try:
        # retrieves input as string
        input = hex2str(data["payload"])
        logger.info(f"Received input: '{input}'")

        # converts input to the format expected by the m2cgen model
        input_json = json.loads(input)
        input_formatted = format(input_json)

        # computes predicted classification for input  
        print(input_formatted)      
        predicted = classify(input_formatted)
        logger.info(f"Data={input}, Predicted: {predicted}")

        # emits output notice with predicted class name
        counter_hex = f"0x{predicted:064x}"
        logger.info(f"Adding notice with payload: {predicted}")
        response = emit_notice({"payload": counter_hex})

    except Exception as e:
        status = "reject"
        msg = f"Error processing data {data}\n{traceback.format_exc()}"
        logger.error(msg)
        response = requests.post(rollup_server + "/report", json={"payload": str2hex(msg)})
        logger.info(f"Received report status {response.status_code} body {response.content}")

    return status


def handle_inspect(data):
    logger.info(f"Received inspect request data {data}")
    emit_notice(data)
    return "accept"


handlers = {
    "advance_state": handle_advance,
    "inspect_state": handle_inspect,
}

finish = {"status": "accept"}

while True:
    logger.info("Sending finish")
    response = requests.post(rollup_server + "/finish", json=finish)
    logger.info(f"Received finish status {response.status_code}")
    if response.status_code == 202:
        logger.info("No pending rollup request, trying again")
    else:
        rollup_request = response.json()
        data = rollup_request["data"]
        handler = handlers[rollup_request["request_type"]]
        finish["status"] = handler(rollup_request["data"])
