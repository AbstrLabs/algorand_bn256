async function run (runtimeEnv, deployer) {
  console.log('zkp verifier py script deploy started!');

  approvalProgramFileName = 'zkp_verifier.py';
  clearProgramFileName = 'clear.teal';

  const master = deployer.accountsByName.get('master');

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
    {}
  )
  console.log('zkp verifier py deploy finished!');
}

module.exports = { default: run };
