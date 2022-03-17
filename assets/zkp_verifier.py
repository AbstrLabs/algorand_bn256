import sys
sys.path.insert(0,'.')

from algobpy.parse import parse_params
from pyteal import *


def flatten(t):
    return [item for sublist in t for item in sublist]


def zkp_verifier_program(VK_ALPHA, VK_BETA, VK_DELTA, VK_GAMMA, VK_IC, INPUT_LEN):
    handle_creation = Return(Int(1))
    handle_opt_in = Return(Int(1))
    handle_closeout = Return(Int(1))
    handle_updateapp = Return(Global.creator_address() == Txn.sender())
    handle_deleteapp = Return(Global.creator_address() == Txn.sender())

    vk_x = ScratchVar(TealType.bytes)
    vk_ic = Bytes('base16', VK_IC)

    def vk_x_single_step(i, inp):
        icip1 = Substring(vk_ic, Int((i+1)*64), Int((i+2)*64))
        inpi = Substring(inp, Int(i*4), Int((i+1)*4))
        ak = BN256ScalarMul(icip1, inpi)
        return [
            vk_x.store(BN256Add(vk_x.load(), ak)),
            Log(vk_x.load()),
        ]

    def vk_x_loop(inp):
        return flatten([vk_x_single_step(i, inp) for i in range(INPUT_LEN)])

    ic0 = Substring(vk_ic, Int(0), Int(64))
    inp = Txn.application_args[1]
    verify = Seq(
        [
            vk_x.store(Bytes('base16', '00'* 64)),
            *vk_x_loop(inp),
            vk_x.store(BN256Add(vk_x.load(), ic0)),
            # todo: teal does not support 256 bit integer arithmetic, caller pre calc for now
            Return(Int(1)),
        ]
    )

    handle_no_op = Cond(
        [
            Txn.application_args.length() == Int(0),
            Return(Int(1)),
        ],
        [
            And(
                Global.group_size() == Int(16),
                Txn.application_args[0] == Bytes("verify"),
            ),
            verify,
        ],
    )

    program = Cond(
        [Txn.application_id() == Int(0), handle_creation],
        [Txn.on_completion() == OnComplete.OptIn, handle_opt_in],
        [Txn.on_completion() == OnComplete.CloseOut, handle_closeout],
        [Txn.on_completion() == OnComplete.UpdateApplication, handle_updateapp],
        [Txn.on_completion() == OnComplete.DeleteApplication, handle_deleteapp],
        [Txn.on_completion() == OnComplete.NoOp, handle_no_op],
    )
    return program


if __name__ == "__main__":
    print(compileTeal(zkp_verifier_program('','','','',
    '05bc54586d732c5ad56b845054da1854a3db5f25aac3d2809f0f0d1ca217d0c21907ef0b652fbd125ce4be4d63f35942a31fc5fe2f6074d359d6673bc9ca2f610e801f89bdb9e12cb03afac9950becb11123619653081b184a6507fc7b099e732adc8de696f5d8469d300c6e8863e6d946768790d7a4df02e78b6edbd75ced2d2acdf61a72c0296e33b656718d23c1f927ef7096fdfed4dea0fcaafe5031e1290ed56d0b58c1882388c0f3f3514e875f49bd6965a09c22b3d68dc4305b4ac89716561820aeeeafde3080bec208bd7b7684437bafd392faa2bbc26c487fc76a291048874de61576e700e220c126aa738fe0aab92b3a6d17aa36f27117eec743cd04255c4ae49e164857afa78611e8383a05d7f59d05192ef4bb0a2ff25bbd6bae0363dca49a1d5eb2752832baa45edaca1afd6f6651a87e42b363a9f5747e869f1dc4927a76ae95801fd674b9895adcb5ba710153a310cd69cf5cf7d08b49c33b14d5146d3f00f2aab6153447197341f835de364615597cc610ef3c681cbe8e302aa9423c17f5f5d18c4ff86803d9e2198b9fba8740662cdd70beacced2d6061c2cd6aab6668dab5475a436e77e166814adefc6db5e6434fa9334dcb33f4b9c9f0e5badec1f7cbc94062ee439c2989445e7df8734b3623fd19d22e96c2ba54a640bbc672e95c318744fe105315a413d759f5466be6c0866e0988f9a3b4ed72b020d0c8ffe1802301d5527e9e373deea8beaf10bca39e58d666238e97fb641b9831ee9e43c6080696d338a518643c6997a23db4ad6992248e9eb2a570e1a08718309aeadb16d0cffa6bb77c01496ac88e4834616957d174d303548b75a61b2d5cb277871333786b8104dca3f12ba729014dbffd333ad6abeb41e7ab49f3ad9ca7a',
    9), Mode.Application, version=6))
