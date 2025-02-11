# m2cgen DApp

This example shows a simple way of leveraging some of the most widely used Machine Learning libraries available in Python.

The DApp generates a [logistic regression](https://en.wikipedia.org/wiki/Logistic_regression) model using [scikit-learn](https://scikit-learn.org/), [NumPy](https://numpy.org/) and [pandas](https://pandas.pydata.org/), and then uses [m2cgen (Model to Code Generator)](https://github.com/BayesWitnesses/m2cgen) to transpile that model into native Python code with no dependencies.
This approach is inspired by [Davis David's Machine Learning tutorial](https://www.freecodecamp.org/news/transform-machine-learning-models-into-native-code-with-zero-dependencies/), and is useful for a Cartesi DApp because it removes the need of porting all those Machine Learning libraries to the Cartesi Machine's RISC-V architecture, making the development process easier and the final back-end code simpler to execute.

The practical goal of this application is to predict a classification based on the [Titanic dataset](https://www.kaggle.com/competitions/titanic/data), which shows characteristics of people onboard the Titanic and whether that person survived the disaster or not.
As such, users can submit inputs describing a person's features to find out if that person is likely to have survived.

The model currently takes into account only three characteristics of a person to predict their survival, even though other attributes are available in the dataset:

1. Age
2. Sex, which can be `male` or `female`
3. Embarked, which corresponds to the port of embarkation and can be `C` (Cherbourg), `Q` (Queenstown), or `S` (Southampton)

As such, inputs to the DApp should be given as a JSON string such as the following:

```json
{ "Age": 37, "Sex": "male", "Embarked": "S" }
```

The predicted classification result will be given as `0` (did not survive) or `1` (did survive).

## Steps to run locally
### Install cartesi-coprocessor cli 
```
cargo install cartesi-coprocessor
```

### 1. Run Cartesi-Coprocessor Devnet Environment

Before running the dApp, you need to have the Coprocessor devnet environment running. It will spin up a local operator in devnet mode that will host the dApp backend.

Refer to [mugen-docs](https://docs.mugen.builders/cartesi-co-processor-tutorial/introduction) to understand the components and setup the environment

```bash
cartesi-coprocessor start-devnet
```
> To stop and clean up the environment later, use: `cartesi-coprocessor stop-devnet`

### 2. Build and Deploy Backend Cartesi Machine

Navigate to `backend-cartesi-survivor-py/` and run the following command to  deploy the backend.

```bash
cartesi-coprocessor publish --network devnet
```
## Changing the application

This DApp was implemented in a rather generic way and, as such, it is possible to easily change the target dataset as well as the predictor algorithm.

To change those, open the file `m2cgen/model/build_model.py` and change the following variables defined at the beginning of the script:

- `model`: defines the scikit-learn predictor algorithm to use. While it currently uses `sklearn.linear_model.LogisticRegression`, many [other possibilities](https://scikit-learn.org/stable/modules/classes.html) are available, from several types of linear regressions to solutions such as support vector machines (SVMs).
- `train_csv`: a URL or file path to a CSV file containing the dataset. It should contain a first row with the feature names, followed by the data.
- `include`: an optional list indicating a subset of the dataset's features to be used in the prediction model.
- `dependent_var`: the feature to be predicted, such as the entry's classification
