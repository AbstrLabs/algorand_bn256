
const { Runtime, AccountStore } = require('@algo-builder/runtime');
const { types } = require('@algo-builder/web');
const { assert } = require('chai') .use(require('chai-bytes'));
const fs = require('fs')

let appID;

describe("bn128 py contract", function () {
  const fee = 1000;
  const minBalance = BigInt(1e6);
  const john = new AccountStore(minBalance + BigInt(fee));

  const txParamsUpload = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    appArgs: ["str:upload", new Uint8Array(2048)]
  };

  const txParams0 = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    // appArgs: ["str:upload", new Uint8Array(fs.readFileSync('assets/tls_primary_in'))]
    appArgs: ["str:expensive"]

  };

  const txParams = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    // appArgs: ["str:upload", new Uint8Array(fs.readFileSync('assets/tls_primary_in'))]
    appArgs: ['str:verify']
  };

  const txEmpty = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    appArgs: [],
  }

  function groupTx(txParams) {
    txEmpty.appID = txParams.appID
    let ret = [txParams]
    for (i = 0; i < 15; i++) {
      ret.push(txEmpty)
    }
    return ret
  }

  let runtime;
  let approvalProgramFileName;
  let clearProgramFileName;
  this.beforeAll(function () {
    runtime = new Runtime([john]); // setup test
    approvalProgramFileName = 'zkp_verifier.py';
    clearProgramFileName = 'clear.teal';

    // deploy a new app
    appID = runtime.deployApp(
      approvalProgramFileName,
      clearProgramFileName,
      {
        sender: john.account,
        globalBytes: 1,
        globalInts: 0,
        localBytes: 0,
        localInts: 0,
      },
      {}
    ).appID;

    // opt-in to the app
    // runtime.optInToApp(john.address, txParams.appID, {}, {});
    runtime.optInToApp(john.address, appID, {}, {});

  });

  const key = "zkinput";

  // it("should initialize state to empty bytes after opt-in", function () {
  //   const globalState = runtime.getGlobalState(txParams.appID, key);
  //   assert.isDefined(globalState);
  //   assert.equal(globalState, '');
  // });

  it("should set state on first call", function () {
    txParams.appID = appID
    let receipt = runtime.executeTx(groupTx(txParams));
    console.log(receipt[0])

    // const globalState = runtime.getGlobalState(appID, key);
    // console.log(globalState)
    // assert.equalBytes(globalState, readFileSYnc('assets/tls_primary_in'), 'error message');
    // assert.equal(globalState, new Uint8Array([97,98,99,100,101,102,103]));
  });
});