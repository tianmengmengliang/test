

// 订单
const order = {
    status: {
        '0': '待提交',
        '-1': '拒绝订单',
        '1': '等待确认',
        '2': '确认订单',
        '9': '完成审批',
        '19': '完成核销',
        '29': '完成报检申请',
        '39': '完成运输',
        '49': '完成报检查验'
    },
    orderType: {
        '1': '委托贸易订单',
        '2': '委托物流订单',
        '3': '查验订单'
    },
    takeType: {
        1: '自提',
        2: '平台提货'
    }
};

const tms = {
    typeOfCar: {
        1: '普通车',
        2: '冷链车'
    },
    tempType: {
        1: '常温',
        2: '冷链(2℃~8℃)',
        3: '冷冻'
    },
    status: {
        0: '待分配',
        1: '待提货',
        10: '运输中',
        20: '已签收'
    },
    transportType: {
        1: '海运',
        2: '陆运',
        3: '空运'
    }
};

const rns = {
    type: {
        1: '收货',
        2: '发货'
    },
    coldChainType: {
        0: '常温运输',
        1: '普通冷链',
        2: '医智捷冷链'
    }
};

const inspection = {
    checkType: {
        1: '远程查验',
        2: '现场查验',
        3: '不查验'
    },
    checkResult: {
        '1': '查验不通过',
        '2': '查验通过'
    },
    status: {
        0: '未通知国检',
        1: '已通知国检',
        2: '已分配任务',
        3: '查验员已确认任务',
        4: '查验开始',
        5: '完成查验',
        9: '已关闭任务'
    },
    yzj:{
        notification: {
            status: {
                0: '未通知国检',
                1: '已通知国检',
                2: '已分配任务',
                3: '查验员确认任务',
                4: '开始检查',
                5: '完成检查',
                9: '关闭任务'
            }
        },
        task: {
            status: {
                0: '未通知国检',
                1: '已通知国检',
                2: '已分配任务',
                3: '查验员已确认任务',
                4: '查验开始',
                5: '完成查验',
                9: '已关闭任务'
            }
        }
    },
    ciq: {
        notification: {
            status: {
                0: '未通知国检',
                1: '未分配任务',
                2: '已分配任务',
                3: '查验员确认任务',
                4: '开始检查',
                5: '完成检查',
                9: '关闭任务'
            }
        },
        task: {
            status: {
                0: '未通知国检',
                1: '未分配任务',
                2: '已分配任务',
                3: '查验员已确认任务',
                4: '查验开始',
                5: '完成查验',
                9: '已关闭任务'
            }
        }
    },
    ciqCheckViewer: {
        unConfirmedTask: {
            status: {
                0: '未通知国检',
                1: '未分配任务',
                2: '未确认查验任务',
                3: '已确认查验任务',
                4: '开始检查',
                5: '完成检查',
                9: '关闭任务'
            }
        },
        confirmedTask: {
            status: {
                0: '未通知国检',
                1: '未分配任务',
                2: '未确认查验任务',
                3: '已确认查验任务',
                4: '查验开始',
                5: '完成查验',
                9: '已关闭任务'
            }
        }
    },
};

// 产品metaData
const _product = {
    itemTypes:[
        {
            value: 1,
            title: '人体组织',
            itemTypes: [
                {
                    value: 1,
                    title: '人体器官'
                },
                {
                    value: 2,
                    title: '组织'
                },
                {
                    value: 3,
                    title: '人胚活细胞'
                },
                {
                    value: 4,
                    title: '细胞'
                },
                {
                    value: 5,
                    title: '痰液'
                },
                {
                    value: 6,
                    title: '尿液'
                },
                {
                    value: 7,
                    title: '其他'
                },
                {
                    value: 8,
                    title: '排泄物'
                },
                {
                    value: 9,
                    title: '分泌物'
                },
                {
                    value: 10,
                    title: '细胞组'
                },
                {
                    value: 11,
                    title: '细胞系'
                }
            ]
        },
        {
            value: 2,
            title: '微生物',
            itemTypes: [
                {
                    value: 1,
                    title: '细菌'
                },
                {
                    value: 2,
                    title: '病毒'
                },
                {
                    value: 3,
                    title: '真菌'
                },
                {
                    value: 4,
                    title: '放线菌'
                },
                {
                    value: 5,
                    title: '螺旋体'
                },
                {
                    value: 6,
                    title: '立克次氏体'
                },
                {
                    value: 7,
                    title: '支原体'
                },
                {
                    value: 8,
                    title: '衣原体'
                },
                {
                    value: 9,
                    title: '强病毒'
                },
                {
                    value: 10,
                    title: '其他'
                }
            ]
        },
        {
            value: 3,
            title: '生物制品',
            itemTypes: [
                {
                    value: 1,
                    title: '菌苗'
                },
                {
                    value: 2,
                    title: '疫苗'
                },
                {
                    value: 3,
                    title: '抗毒素'
                },
                {
                    value: 4,
                    title: '酶制剂'
                },
                {
                    value: 5,
                    title: '诊断试剂'
                },
                {
                    value: 6,
                    title: '其他活性制剂'
                },
                {
                    value: 7,
                    title: '其他'
                }
            ]
        },
        {
            value: 4,
            title: '人体组织',
            itemTypes: [
                {
                    value: 1,
                    title: '全血'
                },
                {
                    value: 2,
                    title: '血浆'
                },
                {
                    value: 3,
                    title: '脐带血'
                },
                {
                    value: 4,
                    title: '红细胞'
                },
                {
                    value: 5,
                    title: '白蛋白'
                },
                {
                    value: 6,
                    title: '球蛋白'
                },
                {
                    value: 7,
                    title: '纤维蛋白原'
                },
                {
                    value: 8,
                    title: '因子制剂'
                },
                {
                    value: 9,
                    title: '血小板'
                },
                {
                    value: 10,
                    title: '白细胞'
                },
                {
                    value: 11,
                    title: '血清'
                },
                {
                    value: 12,
                    title: '血蛋白'
                }
            ]
        },
        {
            value: 5,
            title: 'v/w非特殊物品',
            itemTypes: [
                {
                    value: 1,
                    title: 'v/w非特殊物品'
                }
            ]
        }
    ],
    countUnit: [
        {
            value: 1,
            title: '国际单位',
        },
        {
            value: 2,
            title: '盒',
        },
        {
            value: 3,
            title: '箱',
        },
        {
            value: 4,
            title: '套',
        },
        {
            value: 5,
            title: '支',
        },
        {
            value: 6,
            title: '瓶',
        },
        {
            value: 7,
            title: '桶',
        },
        {
            value: 8,
            title: '袋',
        },
        {
            value: 9,
            title: '毫升',
        },
        {
            value: 10,
            title: '人份',
        },
        {
            value: 11,
            title: '其他',
        },
    ],
    weightUnit: [
        {
            value: 1,
            title: '千克',
        },
        {
            value: 2,
            title: '克',
        },
        {
            value: 3,
            title: '毫克',
        },
        {
            value: 4,
            title: '升',
        },
        {
            value: 5,
            title: '毫升',
        }
    ],
    valueUnit: [
        {
            value: 1,
            title: '美元USD',
        }
    ]
};

/*let _i = {};
_product.itemTypes[0].itemTypes.map(({value, title})=>{
    _i[value] = title;
});
console.log(_i);*/

const product = {
    itemTypes: {
        '人体组织': {
            title: "人体组织",
            itemTypes: {
                '人体器官': "人体器官",
                '组织': "组织",
                '人胚活细胞': "人胚活细胞",
                '细胞': "细胞",
                '痰液': "痰液",
                '尿液': "尿液",
                '其它': "其它",
                '排泄物': "排泄物",
                '分泌物': "分泌物",
                '细胞组': "细胞组",
                '细胞系': "细胞系",
            }
        },
        '微生物': {
            title: "微生物",
            itemTypes: {
                '细菌': "细菌",
                '病毒': "病毒",
                '真菌': "真菌",
                '放线菌': "放线菌",
                '螺旋体': "螺旋体",
                '立克次氏体': "立克次氏体",
                '支原体': "支原体",
                '衣原体': "衣原体",
                '强病毒': "强病毒",
                '其它': "其它"

            }
        },
        '生物制品': {
            title: "生物制品",
            itemTypes: {
                '菌苗': "菌苗",
                '疫苗': "疫苗",
                '抗毒素': "抗毒素",
                '酶制剂': "酶制剂",
                '诊断试剂': "诊断试剂",
                '其它活性制剂': "其它活性制剂",
                '其它': "其它"
            }
        },
        '血液及其制品': {
            title: "血液及其制品",
            itemTypes: {
                '全血': "全血",
                '血浆': "血浆",
                '脐带血': "脐带血",
                '红细胞': "红细胞",
                '白蛋白': "白蛋白",
                '球蛋白': "球蛋白",
                '纤维蛋白原': "纤维蛋白原",
                '因子制剂': "因子制剂",
                '血小板': "血小板",
                '白细胞': "白细胞",
                '血清': "血清",
                '血蛋白': "血蛋白",
                '其它': "其它"
            }
        },
        'v/w非特殊物品': {
            title: 'v/w非特殊物品',
            itemTypes: {
                'v/w非特殊物品': 'v/w非特殊物品'
            }
        }
    },
    countUnit: {
        '国际单位': "国际单位",
        '盒': "盒",
        '箱': "箱",
        '套': "套",
        '支': "支",
        '瓶': "瓶",
        '桶': "桶",
        '袋': "袋",
        '个': "个",
        '毫升': "毫升",
        '人份': "人份",
        '其他': "其他"
    },
    weightUnit: {
        '千克': "千克",
        '克': "克",
        '毫克': "毫克",
        '升': "升",
        '毫升': "毫升"
    },
    valueUnit: {
        '美元USD': "美元USD",
        '美元': "美元USD"
    },
    productRank: {
        0: 'v/w非特殊物品',
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D'
    },
    filingStatus: {
        0: '未备案',
        1: '已备案'
    }
}

// 自定义类型
const custom = {
    sex: {
        '0': '不限',
        '1': '男',
        '2': '女',
    },
    level: {
        0: 'v/w非特殊物品',
        1: 'A',
        2: 'B',
        3: 'C',
        4: 'D'
    }
};

// platform平台
const platform = {
    user: {
        '-1': '拒绝',
        '0': '未提交',
        '1': '待审核',
        '2': '已通过'
    }
};

// 后续监管
const supervision = {
    entryStatus: {
        '0': '未确认',
        '1': '已确认'
    },
    chayanStatus: {
        '0': '未查验',
        '1': '查验不合格',
        '2': '查验合格'
    },
    jgStatus: {
        '1': '未监管',
        '4': '监管结束'
    },
    jgResult: {
        '0': '未监管',
        '1': '合格',
        '2': '不合格'
    }
};

export default {
    order,
    tms,
    rns,
    inspection,
    product,
    _product,
    custom,
    platform,
    supervision
}
