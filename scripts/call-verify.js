const { executeTransaction } = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');
const fs = require('fs').promises

async function run (runtimeEnv, deployer) {

  const master = deployer.accountsByName.get('master');
  console.log(master.addr)

  const fee = 1000;

  let inputFile = process.env['ZKP_INPUT'] ? process.env['ZKP_INPUT'] : 'assets/primary.in.gnark'
  let inputBeforeHashFile = process.env['ZKP_INPUT_BEFORE_HASH'] ? process.env['ZKP_INPUT_BEFORE_HASH'] : 'assets/before_hash.in'
  let proofFile = process.env['ZKP_PROOF'] ? process.env['ZKP_PROOF'] : 'assets/proof.gnark'
  let proofFileNegA = proofFile + '.negA'
  let proofFileB = proofFile + '.B'
  let proofFileC = proofFile + '.C'
  let input = await fs.readFile(inputFile)
  let inputBeforeHash = await fs.readFile(inputBeforeHashFile)
  let proofNegA = await fs.readFile(proofFileNegA)
  let proofB = await fs.readFile(proofFileB)
  let proofC = await fs.readFile(proofFileC)
  let timestamp = inputBeforeHash.slice(0, 8)
  let content = inputBeforeHash.slice(8)

  const appID = process.env['ALGORAND_APP_ID'] ? Number(process.env['ALGORAND_APP_ID']) : 2;

  const optInParams = {
    type: types.TransactionType.OptInToApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee }
  }

  const txParams = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee },
    appArgs: ['str:verify1', 
      new Uint8Array(input),
    ]
  };

  const txParams2 = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee },
    appArgs: ['str:verify2', 
      new Uint8Array(proofNegA),
      new Uint8Array(proofB),
      new Uint8Array(proofC),
    ]
  };

  const txParams3 = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee },
    appArgs: ['str:verify3', 
      new Uint8Array(timestamp),
      new Uint8Array(content),
    ]
  };

  function emptyTx(appId, i) {
    return {
      type: types.TransactionType.CallApp,
      sign: types.SignType.SecretKey,
      fromAccount: master,
      appID: appId,
      payFlags: { totalFee: fee },
      // each txn in the grouped txn need to be unique, so adding this
      appArgs: [`str:${i}`],
    }
  }

  function groupTx(txParams) {
    let ret = [txParams]
    for (i = 0; i < 15; i++) {
      ret.push(emptyTx(txParams.appID, i))
    }
    return ret
  }

  try {
    await executeTransaction(deployer, optInParams);
  } catch (e) {
    console.log(e)
  }
  let res = await executeTransaction(deployer, groupTx(txParams));
  console.log('verify1 done')
  let res2 = await executeTransaction(deployer, groupTx(txParams2));
  console.log('verify2 done')
  let res3 = await executeTransaction(deployer, groupTx(txParams3));
  console.log('verify3 done')
  console.log('logs:')
  for(let i in res3.logs) {
    console.log(res3.logs[i].toString(i == 1 ? 'hex' : 'utf-8'))
    if (i == 1) {
      console.log(' // ' + new Date(1000 * Number('0x' + res3.logs[i].toString('hex'))).toUTCString())
    }
  }
}


module.exports = { default: run };
