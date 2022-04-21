const { executeTransaction } = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');

async function run (runtimeEnv, deployer) {

  const master = deployer.accountsByName.get('master');
  console.log(master.addr)

  const fee = 1000;

  const appID = 1038;

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
      new Uint8Array(Buffer.from('00000001cdbb6b0c2e65cf2a4d4f2f0873f006232325e680a91af29cb1a45ba025a82b55', 'hex')),
    ]
  };

  const txParams2 = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee },
    appArgs: ['str:verify2', 
      new Uint8Array(Buffer.from('0d285e8d61dc26f734faeebf58d61cfd1257e8ec3bab354b7c92c2172c5a6ccc0d36e2d99645bc02ad8524f9f5c830e9f3440729026756214a868dd49b4e5146', 'hex')),
      new Uint8Array(Buffer.from('29536a49ce78f60237850de716a56f7b93b669f629771a7d1f374fa192f1917f150f2ea07470bfe694b1c1bb65bf4fd88c3f4b026b17c87677999748c8e664c216e9bf0d75150d58e2b3d02b5df1dd3c63dc14528a2f4b8e5c1a41d3ecab01df0b66c674784048dd73c7c307ad224e778d13a7bc11591e8418e63c58881f5542', 'hex')),
      new Uint8Array(Buffer.from('01f5ae49470f2339ba2e73d7e7888fa1b1608ea811b9f31123158167f9137d5710e0a8d01c768868b2175903fe36449ace8d36b5e3fff682cdaa0a6c6aab4a83', 'hex'))
    ]
  };

  const txParams3 = {
    type: types.TransactionType.CallApp,
    sign: types.SignType.SecretKey,
    fromAccount: master,
    appID: appID,
    payFlags: { totalFee: fee },
    appArgs: ['str:verify3', 
      new Uint8Array(Buffer.from('0000000061bf4e4e', 'hex')),
      new Uint8Array(Buffer.from('7b0a2020202022476c6f62616c2051756f7465223a207b0a20202020202020202230312e2073796d626f6c223a202249424d222c0a20202020202020202230322e206f70656e223a20223132352e38373030222c0a20202020202020202230332e2068696768223a20223132382e36343030222c0a20202020202020202230342e206c6f77223a20223132352e32303933222c0a20202020202020202230352e207072696365223a20223132372e34303030222c0a20202020202020202230362e20766f6c756d65223a20223130333832363933222c0a20202020202020202230372e206c61746573742074726164696e6720646179223a2022323032312d31322d3137222c0a20202020202020202230382e2070726576696f757320636c6f7365223a20223132352e39333030222c0a20202020202020202230392e206368616e6765223a2022312e34373030222c0a20202020202020202231302e206368616e67652070657263656e74223a2022312e3136373325220a202020207d0a7d', 'hex')),
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
  console.log(res3)
}


module.exports = { default: run };
