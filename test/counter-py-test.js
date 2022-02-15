
const { Runtime, AccountStore } = require('@algo-builder/runtime');
const { types } = require('@algo-builder/web');
const { assert } = require('chai');


describe("Algorand counter py contract", function () {
  const fee = 1000;
  const minBalance = BigInt(1e6);
  const john = new AccountStore(minBalance + BigInt(fee));

  const txParams = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: john.account,
    appID: 0,
    payFlags: { totalFee: fee },
    appArgs: ["str:Add"]
  };

  let runtime;
  let approvalProgramFileName;
  let clearProgramFileName;
  this.beforeAll(function () {
    runtime = new Runtime([john]); // setup test
    approvalProgramFileName = 'counter.py';
    clearProgramFileName = 'clear.teal';

    // deploy a new app
    txParams.appID = runtime.deployApp(
      approvalProgramFileName,
      clearProgramFileName,
      {
        sender: john.account,
        globalBytes: 0,
        globalInts: 1,
        localBytes: 0,
        localInts: 0,
      },
      {}
    ).appID;

    // opt-in to the app
    runtime.optInToApp(john.address, txParams.appID, {}, {});
  });

  const key = "Count";

  it("should initialize Counter to 0 after opt-in", function () {
    const globalCounter = runtime.getGlobalState(txParams.appID, key);
    assert.isDefined(globalCounter);
    assert.equal(globalCounter, 0n);
  });

  it("should set global counter to 1 on first call", function () {
    runtime.executeTx(txParams);

    const globalCounter = runtime.getGlobalState(txParams.appID, key);
    assert.equal(globalCounter, 1n);
  });

  it("should update counter by +1 for both global and local states on second call", function () {
    const globalCounter = runtime.getGlobalState(txParams.appID, key);

    assert.equal(globalCounter, 1n);

    runtime.executeTx(txParams);

    const newGlobalCounter = runtime.getGlobalState(txParams.appID, key);
    assert.equal(newGlobalCounter, globalCounter + 1n);
  });
});