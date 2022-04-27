const fs = require('fs').promises

async function run (runtimeEnv, deployer) {
  console.log('zkp verifier py script deploy started!');

  let approvalProgramFileName = 'zkp_verifier.py';
  let clearProgramFileName = 'clear.teal';

  let vkFile = process.env['VK_FILE'] ? process.env['VK_FILE'] : 'assets/verification.key.gnark'

  const master = deployer.accountsByName.get('master');

  let scInitParam = await parseVk(vkFile)

  const res = await deployer.deployApp(
    approvalProgramFileName,
    clearProgramFileName,
    {
      sender: master,
      globalBytes: 0,
      globalInts: 0,
      localBytes: 5,
      localInts: 1,
    },
    {},
    scInitParam,
  )
  console.log('zkp verifier py deploy finished!');
}

async function parseVk(vkFile) {
  let ret = {}
  let data = await fs.readFile(vkFile)
  ret['VK_ALPHA_HEX'] = data.slice(0, 64).toString('hex')
  ret['VK_BETA_HEX'] = data.slice(64, 192).toString('hex')
  ret['VK_DELTA_HEX'] = data.slice(192, 320).toString('hex')
  ret['VK_GAMMA_HEX'] = data.slice(320, 448).toString('hex')
  ret['VK_IC_HEX'] = data.slice(448).toString('hex')
  return ret
}

module.exports = { default: run };
