import sys
sys.path.insert(0,'.')

from algobpy.parse import parse_params
from pyteal import *


def zkp_verifier_program(VK_ALPHA, VK_BETA, VK_DELTA, VK_GAMMA, VK_IC, INPUT_LEN):
    handle_creation = Return(Int(1))
    handle_opt_in = Return(Int(1))
    handle_closeout = Return(Int(1))
    handle_updateapp = Return(Global.creator_address() == Txn.sender())
    handle_deleteapp = Return(Global.creator_address() == Txn.sender())

    vk_x = ScratchVar(TealType.bytes)
    i = ScratchVar(TealType.uint64)

    verify = Seq(
        [
            vk_x.store(Bytes('base16', '00'* 64)),
            For(i.store(Int(0)), i.load() < Int(INPUT_LEN), i.store(i.load() + Int(1))).Do(Seq(
                # todo: change to bn256 scalar mut
                vk_x.store(SetByte(vk_x.load(), i.load(), i.load())),
                # todo: change to bn256 add
                vk_x.store(SetByte(vk_x.load(), i.load(), i.load())),
                Log(vk_x.load()),
            )),
            # todo: change to bn256 add
            vk_x.store(SetByte(vk_x.load(), Int(10), Int(10))),
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
    print(compileTeal(zkp_verifier_program('','','','','',9), Mode.Application, version=6))
