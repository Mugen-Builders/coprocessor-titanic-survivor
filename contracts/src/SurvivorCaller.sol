// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../lib/coprocessor-base-contract/src/CoprocessorAdapter.sol";

contract SurvivorCaller is CoprocessorAdapter {
    uint256 public survive;
    event ResultReceived(bytes output);

    constructor(address _coprocessorAddress, bytes32 _machineHash) CoprocessorAdapter(_coprocessorAddress, _machineHash) {}

    function runExecution(bytes calldata input) external {
        callCoprocessor(input);
    }

    function handleNotice(bytes memory notice) internal override {
        require(notice.length >= 32, "Invalid notice length");
        survive = abi.decode(notice, (uint256));
        emit ResultReceived(notice);
    }

    function get() external view returns (uint256) {
        return survive;
    }

}