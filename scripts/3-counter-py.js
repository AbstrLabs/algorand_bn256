async function run (runtimeEnv, deployer) {
  console.log('Counter py script execution started!');

  const counter = await deployer.loadLogic('counter.py', {});

  await deployer.addCheckpointKV('User Checkpoint Counter py', `Counter Account: ${counter.address()}`);
  console.log('Counter py script execution finished!');
}

module.exports = { default: run };
