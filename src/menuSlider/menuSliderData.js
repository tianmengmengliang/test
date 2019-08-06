/**
 * Created by jpt on 2018/4/14 0014.
 */
const url = require('js-url')


let menusDataDef=[
  /* 企业用户导航配置 */
  [
    {
      title:'订单管理',
      iconType:'shopping-cart',
      key:'order',
      children:[
        {
          title:'订单列表',
          iconType:'bars',
          key:'list',
        }
      ]
    },
    {
      title:'运输管理',
      iconType:'car',
      key:'transport',
      children:[
        {
          title:'运输任务单',
          iconType:'mail',
          key:'task',
        }
      ]
    },
    {
      title:'查验管理',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'查验结果管理',
          iconType:'exception',
          key:'result',
        }
      ]
    },
    {
      title:'后续监管',
      iconType:'pie-chart',
      key:'hxjg',
      children:[
        {
          title:'监管列表',
          iconType:'eye-o',
          key:'hxjgList',
        },
        {
          title:'使用登记',
          iconType:'edit',
          key:'useLog2',
        },
      ]
    },
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'submit',
      children: [
        {
          title:'未提交申请单',
          iconType:'schedule',
          key:'submit',
        },
        {
          title:'审批中申请单',
          iconType:'exception',
          key:'audit',
        },
        {
          title:'已完成评估申请单',
          iconType:'exception',
          key:'complete',
        }
      ]
    }
  ],
  /* 医智捷运营管理导航配置 */
  [
    {
      title:'订单管理',
      iconType:'shopping-cart',
      key:'order',
      children:[
        {
          title:'订单列表',
          iconType:'bars',
          key:'query',
        }
      ]
    },
    {
      title:'收发货管理',
      iconType:'gift',
      key:'receiptAndSend',
      children:[
        {
          title:'收货登记',
          iconType:'verticle-right',
          key:'receipt',
        },
        {
          title:'发货登记',
          iconType:'verticle-left',
          key:'send',
        }
      ]
    },
    {
      title:'运输管理',
      iconType:'car',
      key:'transport',
      children:[
        {
          title:'运输任务单',
          iconType:'mail',
          key:'transport-task',
        }
      ]
    },
    {
      title:'查验管理',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'查验通知管理',
          iconType:'notification',
          key:'notification',
        },
        {
          title:'查验任务管理',
          iconType:'schedule',
          key:'task',
        },
        {
          title:'查验任务结果',
          iconType:'exception',
          key:'result',
        }
      ]
    },
    {
      title:'用户管理',
      iconType:'usergroup-add',
      key:'user',
      children:[
        {
          title:'用户审核',
          iconType:'solution',
          key:'audit',
        }
      ]
    },
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'submit',
      children: [
        {
          title:'未提交申请单',
          iconType:'schedule',
          key:'submit',
        },
        {
          title:'审批中申请单',
          iconType:'exception',
          key:'audit',
        },
        {
          title:'已完成评估申请单',
          iconType:'exception',
          key:'complete',
        }
      ]
    },
    {
      title:'留言',
      iconType:'credit-card',
      key:'note',
      children:[
        {
          title:'留言列表',
          iconType:'solution',
          key:'list',
        }
      ]
    },
  ],
  /* ciq管理员管理导航配置 */
  [
    {
      title:'查验管理',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'查验任务分配',
          iconType:'notification',
          key:'distribute',
        },
        {
          title:'查验任务处理',
          iconType:'check-circle',
          key:'resolve',
        },
        {
          title:'查验任务结果',
          iconType:'exception',
          key:'result',
        },
        {
          title:'查验任务统计',
          iconType:'database',
          key:'count',
        },
      ]
    },
    {
      title:'特殊物品追溯',
      iconType:'file',
      key:'trace',
      children:[
        {
          title:'运输追溯',
          iconType:'car',
          key:'transport-trace',
        }
      ]
    },
    {
      title:'后续监管',
      iconType:'pie-chart',
      key:'hxjg',
      children:[
        {
          title:'监管列表',
          iconType:'eye-o',
          key:'hxjgList',
        },
        {
          title:'使用登记',
          iconType:'edit',
          key:'useLog',
        }
      ]
    },
    {
      title:'风险评估报告',
      iconType:'schedule',
      key:'fxpg',
      children: [
        {
          title:'统计',
          iconType:'database',
          key:'count2',
        }
      ]
    },
    {
      title:'留言',
      iconType:'credit-card',
      key:'note',
      children:[
        {
          title:'留言列表',
          iconType:'solution',
          key:'list',
        }
      ]
    },
    {
      title:'系统管理',
      iconType:'schedule',
      key:'SM',
      children: [
        {
          title:'用户管理',
          iconType:'database',
          key:'managerUser',
        },
        /* {
         title:'角色管理',
         iconType:'edit',
         key:'managerRole',
         },*/
        {
          title:'风险评估参数管理',
          iconType:'edit',
          key:'managerParmar',
        }
      ]
    },
  ],

  /* ciq查验员管理导航配置*/
  [
    {
      title:'查验管理',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'查验任务处理',
          iconType:'check-circle',
          key:'resolve',
        },
        {
          title:'查验任务结果',
          iconType:'exception',
          key:'result',
        }
      ]
    },
    {
      title:'特殊物品追溯',
      iconType:'file',
      key:'trace',
      children:[
        {
          title:'运输追溯',
          iconType:'car',
          key:'transport-trace',
        }
      ]
    },
    {
      title:'后续监管',
      iconType:'pie-chart',
      key:'hxjg',
      children:[
        {
          title:'监管列表',
          iconType:'eye-o',
          key:'hxjgList',
        },
        {
          title:'使用登记',
          iconType:'edit',
          key:'useLog',
        }
      ]
    },
  ],
  /*----------- 前置审批 ---------*/
  /* 企业*/
  [
    {
      title:'单位菜单',
      iconType:'eye-o',
      key:'preApproval&c',
      children: [
        {
          type: 'group',
          title:'风险评估申请',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'未提交风险评估申请',
              iconType:'schedule',
              key:'submit',
            },
            {
              title:'审批中风险评估申请',
              iconType:'exception',
              key:'audit',
            },
            {
              title:'已完成风险评估申请',
              iconType:'exception',
              key:'complete',
            }
          ]
        },
        {
          type: 'group',
          title:'报表管理',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'报表查询',
              iconType:'area-chart',
              key:'reportQuery&c',
            }
          ]
        }
      ]
    },
    {
      title:'初审员菜单',
      iconType:'eye-o',
      key:'preApproval&c2',
      children: [
        {
          type: 'group',
          title:'专家库',
          // iconType:'schedule',
          // key:'submit',
          children:[
            {
              title:'未处理风险评估申请',
              iconType:'exception',
              key:'experts',
            }
          ]
        },
        {
          type: 'group',
          title:'风险评估申请',
          // iconType:'schedule',
          // key:'submit',
          children:[
            {
              title:'未处理风险评估申请',
              iconType:'exception',
              key:'audit2',
            },
            {
              title:'已完成风险评估申请',
              iconType:'exception',
              key:'complete2',
            }
          ]
        },
        {
          type: 'group',
          title:'现场评估',
          // iconType:'schedule',
          // key:'submit',
          children:[
            {
              title:'未处理现场评估',
              iconType:'exception',
              key:'assess1',
            },
            {
              title:'进行中现场评估',
              iconType:'exception',
              key:'assess2',
            },
            {
              title:'已完成现场评估',
              iconType:'exception',
              key:'assess3',
            }
          ]
        },
        {
          type: 'group',
          title:'报表管理',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'报表查询',
              iconType:'area-chart',
              key:'reportQuery&c2',
            }
          ]
        }
      ]
    },
    {
      title:'专家菜单',
      iconType:'eye-o',
      key:'preApproval&c3',
      children:[
        {
          type: 'group',
          title:'风险评估申请',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'未处理风险评估申请',
              iconType:'exception',
              key:'audit3',
            },
            {
              title:'已完成风险评估申请',
              iconType:'exception',
              key:'complete3',
            }
          ]
        },
        {
          type: 'group',
          title:'报表管理',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'报表查询',
              iconType:'area-chart',
              key:'reportQuery&c3',
            }
          ]
        }
      ]
    },
    {
      title:'主任菜单',
      iconType:'eye-o',
      key:'preApproval&c4',
      children: [
        {
          type: 'group',
          title:'风险评估申请',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'未处理风险评估申请',
              iconType:'exception',
              key:'audit4',
            },
            {
              title:'已完成风险评估申请',
              iconType:'exception',
              key:'complete4',
            }
          ]
        },
        {
          type: 'group',
          title:'报表管理',
          // iconType:'schedule',
          // key:'submit',
          children: [
            {
              title:'报表查询',
              iconType:'area-chart',
              key:'reportQuery&c4',
            }
          ]
        }
      ]
    },
  ],
  /* 初审员导航配置 */
  [
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'fengping',
      children:[
        {
          title:'专家组',
          iconType:'exception',
          key:'expertgroup',
        },
        {
          title:'未处理申请单',
          iconType:'exception',
          key:'audit2',
        },   /* ]}] */
        {
          title:'已处理申请单',
          iconType:'exception',
          key:'complete2',
        },
        {
          title:'统计',
          iconType:'database',
          key:'count2',
        }
      ]
    },
    {
      title:'专家库',
      iconType:'schedule',
      key:'submit',
      children:[
        {
          title:'录入专家',
          iconType:'exception',
          key:'experts',
        }
      ]
    },
    {
      title:'留言',
      iconType:'credit-card',
      key:'note',
      children:[
        {
          title:'留言列表',
          iconType:'solution',
          key:'list',
        }
      ]
    },
    {/* {
     title:'现场评估',
     iconType:'schedule',
     key:'live',
     children:[
     {
     title:'未处理现场评估',
     iconType:'exception',
     key:'assess1',
     },
     {
     title:'进行中现场评估',
     iconType:'exception',
     key:'assess2',
     },
     {
     title:'已完成现场评估',
     iconType:'exception',
     key:'assess3',
     }
     ]
     },
     {
     title:'报表管理',
     iconType:'schedule',
     key:'table',
     children: [
     {
     title:'报表查询',
     iconType:'area-chart',
     key:'reportQuery&c2',
     }
     ]
     },*/},
  ],
  /* 专家导航配置 */
  [
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'fengping',
      children:[
        {
          title:'未处理申请单',
          iconType:'exception',
          key:'audit2',
        },
        {
          title:'已处理申请单',
          iconType:'exception',
          key:'complete2',
        }
      ]
    },
  ],
  /* 主任导航配置 */
  [
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'submit',
      children: [
        {
          title:'未处理申请单',
          iconType:'exception',
          key:'audit4',
        },
        {
          title:'已完成申请单',
          iconType:'exception',
          key:'complete4',
        }
      ]
    },
    {
      title:'留言',
      iconType:'credit-card',
      key:'note',
      children:[
        {
          title:'留言列表',
          iconType:'solution',
          key:'list',
        }
      ]
    },
  ],
  /* 复审员导航配置 */
  [
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'fengping',
      children:[
        {
          title:'未处理申请单',
          iconType:'exception',
          key:'audit2',
        },
        {
          title:'已完成风险评估申请',
          iconType:'exception',
          key:'complete2',
        }
      ]
    },
  ],
  /* ciqManager */
  [
    {
      title:'查验管理',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'查验任务分配',
          iconType:'notification',
          key:'distribute',
        },
        {
          title:'查验任务处理',
          iconType:'check-circle',
          key:'resolve',
        },
        {
          title:'查验任务结果',
          iconType:'exception',
          key:'result',
        },
        {
          title:'查验任务统计',
          iconType:'database',
          key:'count',
        },
      ]
    },
    {
      title:'特殊物品追溯',
      iconType:'file',
      key:'trace',
      children:[
        {
          title:'运输追溯',
          iconType:'car',
          key:'transport-trace',
        }
      ]
    },
    {
      title:'后续监管',
      iconType:'pie-chart',
      key:'hxjg',
      children:[
        {
          title:'监管列表',
          iconType:'eye-o',
          key:'hxjgList',
        },
        {
          title:'使用登记',
          iconType:'edit',
          key:'useLog',
        }
      ]
    },
    {
      title:'用户注册管理',
      iconType:'usergroup-add',
      key:'user',
      children:[
        {
          title:'用户审核',
          iconType:'solution',
          key:'audit',
        }
      ]
    },
    {
      title:'风险评估申请',
      iconType:'schedule',
      key:'fengping',
      children:[
        {
          title:'专家组',
          iconType:'exception',
          key:'expertgroup',
        },
        /*{
         title:'未处理申请单',
         iconType:'exception',
         key:'audit2',
         },
         {
         title:'已处理申请单',
         iconType:'exception',
         key:'complete2',
         },*/
        {
          title:'统计',
          iconType:'database',
          key:'count2',
        }
      ]
    },
    {
      title:'专家库',
      iconType:'schedule',
      key:'submit',
      children:[
        {
          title:'录入专家',
          iconType:'exception',
          key:'experts',
        }
      ]
    },
    {
      title:'留言',
      iconType:'credit-card',
      key:'note',
      children:[
        {
          title:'留言列表',
          iconType:'solution',
          key:'list',
        }
      ]
    },
    {
      title:'系统管理',
      iconType:'schedule',
      key:'SM',
      children: [
        {
          title:'用户管理',
          iconType:'database',
          key:'managerUser',
        },
        /*{
         title:'角色管理',
         iconType:'edit',
         key:'managerRole',
         },*/
        {
          title:'风险评估参数管理',
          iconType:'edit',
          key:'managerParmar',
        }
      ]
    },
  ],
  /* 校验者 */
  [
    {
      title:'js3000系列',
      iconType:'eye-o',
      key:'check',
      children:[
        {
          title:'dll文件更新',
          iconType:'notification',
          key:'distribute',
        },
      ]
    },
  ],
];

//-------------------- 1.-------------------------------------------------------------
function getMenuItemIds(menu, parentId, keyName){
  if(menu instanceof Array){
    return mapMenuItemsData(menu, parentId, keyName);
  }
  if(typeof menu === 'object') {
    if (menu.children) {
      const ids = menu.children.map((item)=> {
        if (item.children) {
          return getMenuItemIds(item.children, `${parentId}${!!parentId ? '/' : ''}${item[keyName]}`, keyName)
        }
      });
      return ids
    } else {
      return `${parentId}/${menu[keyName]}`
    }
  }
  // console.log(ids);
}

function mapMenuItemsData(menu, parentId, keyName){
  let ids = [];
  const menuIds = menu.map((item)=>{
    return getMenuItemIds(item, parentId, keyName);
  });

  // console.log(menuIds)
  return menuIds;
}
//---------------------------------------------------------------------------------

//------------------- 1.根据用户角色返回菜单项 ------------------------------------------------
const menusData = menusDataDef.map((menu, i)=>{
  return  menu.map(( subMenu )=>{
    if( i === 0 ){ subMenu.key = `customer-${subMenu.key}`}
    if( i === 1 ){ subMenu.key = `yzj-${subMenu.key}`}
    if( i === 2 || i === 3 ){ subMenu.key = `eciq-${subMenu.key}`}
    if( i === 4 ){ subMenu.key = `preA-${subMenu.key}`}
    if( i === 5 ){ subMenu.key = `chushenyuan-${subMenu.key}`}
    if( i === 6 ){ subMenu.key = `zhuanjia-${subMenu.key}`}
    if( i === 7 ){ subMenu.key = `zhuren-${subMenu.key}`}
    if( i === 8 ){ subMenu.key = `fushenyuan-${subMenu.key}`}
    if( i === 9 ){ subMenu.key = `eciqManager-${subMenu.key}`}
    if( i ===10 ){ subMenu.key = `js3000-${subMenu.key}`}
    return subMenu
  })
});

/*
 * @interface 根据用户角色返回菜单项
 * @param {string} 当前用户类别
 * @return {array} 当前用户角色菜单项数组
 * */
function returnMenuDataByUserRoles(nameEn){
  const _arr = location.hash.split('?');
  if(_arr.length >=2) {
    _arr[1] = `?${_arr[1]}`;
    const path = _arr[0].substring(1), menuMode = url('?menuMode', _arr[1]), menuItem = url('?menuItem', _arr[1])
    if (path === '\/home' && menuMode === 'test' && menuItem === '4') {
      return menusData[4]
    }
  }
  if(nameEn === 'ciq_kehu'){
    return menusData[0]
  }
  if(nameEn === 'ciq_yunying'){
    return menusData[1]
  }
  if(nameEn === 'ciq_jianyiju'){
    return menusData[2]
  }
  if(nameEn === 'ciq_chayanyuan'){
    return menusData[3]
  }
  if(nameEn === 'ciq_chushenyuan'){
    return menusData[5]
  }
  if(nameEn === 'ciq_zhuanjia'){
    return menusData[6]
  }
  if(nameEn === 'ciq_zhuren'){
    return menusData[7]
  }
  if(nameEn === 'ciq_fushenyuan'){
    return menusData[8]
  }
  if(nameEn === 'ciq_manager'){
    return menusData[9]
  }
  if(nameEn === 'ciq_testers'){
    return menusData[10]
  }
  return []
}

/*
 * @interface 获取制定用户的所有 menuActionId标识符
 * @param {string} nameEn 用户标识符
 * @return {array} 返回制动用户的所有menuActionIds标识符
 * */
function getSpecificActionIds(nameEn){
  let _menuItems = []
  function mapMenuItems(menu, parentId, keyName){
    menu.map((item)=>{
      if(item) {
        if (item.children) {
          const _pId = `${parentId ? parentId : ''}${(parentId && item[keyName]) ? '\/' : ''}${item[keyName] ? item[keyName] : '' }`;
          return mapMenuItems(item.children, _pId , keyName);
        }

        _menuItems.push(
          {
            ...item,
            id: `${parentId ? parentId : ''}${parentId && item[keyName] ? '\/' : ''}${item[keyName] ? item[keyName] : ''}`
          }
        );
      }
    });

    return _menuItems;
  }
  const specificMenuData = returnMenuDataByUserRoles(nameEn);
  mapMenuItems(specificMenuData, '', 'key');

  return _menuItems || [];
}
//------------------------------------------------------------------------------



export {
  menusData,
  returnMenuDataByUserRoles,
  getSpecificActionIds
}
