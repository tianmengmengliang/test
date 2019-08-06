
//1.正式库
// const URL = 'http://api.yizhihui.com/';              //访问服务器的正式库:后台接口。
// const STATIC_FILE_URL = 'http://lab.yizhihui.com/';  //访问服务器的正式库:静态资源。


//2.测试库
//const URL = 'http://apitest.yizhihui.com/'               //访问服务器的测试库:后台接口。
//const STATIC_FILE_URL = 'http://labtest.yizhihui.com/';  //访问服务器的测试库:静态资源。


//const URL = 'http://apitest.yizhihui.com/';        //0.本地开发,访问后台接口。
//or
const URL = 'http://localhost:8080/';
const STATIC_FILE_URL = 'http://localhost:8986/';     //访问本地服务器，静态资源。


const CNT_TYPE = {
  1: 'application/json',
  2: 'multipart/form-data',
  3: 'application/x-www-form-urlencoded; charset=UTF-8'
};

const API = {
  //"login/userInfo": {t: true, cntType: CNT_TYPE[2]},
  "userInfo/login": {t: true, cntType: CNT_TYPE[2]},                         //user登录


  /*----------- 平台 --------------*/
  'api/device/pageListEvent': {t: true, cntType: CNT_TYPE[2]},                        //开机列表
  'api/device/pageListLocation': {t: true, cntType: CNT_TYPE[2]},                     //地理位置
  'api/device/pageListTestInfo': {t: true, cntType: CNT_TYPE[2]},                     //测试列表
  'api/device/pageListError': {t: true, cntType: CNT_TYPE[2]},                        //异常列表

  /*------------ 图表统计 -----------------*/
  //'api/device/0.0.1/statisticsResult': {t: true, cntType: CNT_TYPE[2]},              //开机图表统计

  /*------------ 中国地理位置 -----------------*/
  'publics/china_map_data.js': {t: true, cntType: CNT_TYPE[1]},                  //中国、省市区

  /*----------- 软件更新 --------------*/
  'api/device/updateApplicationTypeSave': {t: true, cntType: CNT_TYPE[1]},      //新增应用类型提交。
  'api/device/pageListUpdateApplicationType': {t: true, cntType: CNT_TYPE[2]},  //应用类型分页列表。
  'api/device/uploadApplication': {t: true, cntType: CNT_TYPE[2]},               //文件上传提交。
  'api/device/pageListUpdateApplicationDetails': {t: true, cntType: CNT_TYPE[2]},  //应用分页列表。

  /*----------- 医嘱 --------------*/
  'doctorAdvice/save': {t: true, cntType: CNT_TYPE[1]},               //医嘱单提交。
  'doctorAdvice/list': {t: true, cntType: CNT_TYPE[2]},           //医嘱分页列表。
  'labDoctorAdviceDetail/listId': {t: true, cntType: CNT_TYPE[2]},      //医嘱项目不分页列表。------可能已废弃。
  'labDoctorAdviceDetail/list': {t: true, cntType: CNT_TYPE[2]},    //详情分页列表。

  'doctorAdvice/remove': {t: true, cntType: CNT_TYPE[1]},              //删除医嘱。
  'dic/list': {t: true, cntType: CNT_TYPE[2]},                          //字典匹配。
  'sampleType/list': {t: true, cntType: CNT_TYPE[2]},                  //样本匹配列表。
  'labProject/listByDeviceTypeId': {t: true, cntType: CNT_TYPE[2]},         //选项目分页列表。
  /*------------- 项目 ------------------*/
  'labProject/save': {t: true, cntType: CNT_TYPE[1]},                 //项目单提交。
  'labProject/list': {t: true, cntType: CNT_TYPE[2]},                 //项目分页列表。
  'labProjectDetail/list': {t: true, cntType: CNT_TYPE[2]},          //详细
  'labProject/remove': {t: true, cntType: CNT_TYPE[2]},               //删除项目。
   /*------------- 仪器类型 ------------------*/
   'deviceType/list': {t: true, cntType: CNT_TYPE[2]},                //仪器类型列表。

   /*----------- 实验室 ------------------*/
   'lab/list': {t: true, cntType: CNT_TYPE[2]},                    //实验室列表
   'lab/save':  {t: true, cntType: CNT_TYPE[1]},                   //新建实验室提交。
   'lab/remove': {t: true, cntType: CNT_TYPE[2]},                  //删除实验室。
   //'labDoctorAdvice/save':  {t: true, cntType: CNT_TYPE[2]},       //实验室选医嘱提交。
   'lab/addDoctorAdvice':  {t: true, cntType: CNT_TYPE[1]},     //实验室选医嘱提交。
   'lab/addRecipe':  {t: true, cntType: CNT_TYPE[1]},            //实验室选套餐提交。
   /*----------- 实验室 - 医嘱 ------------------*/
   'lab/getDoctorAdviceByLabId':  {t: true, cntType: CNT_TYPE[2]},     //实验室id,查医嘱列表。
   'labRecipe/listByLabId':  {t: true, cntType: CNT_TYPE[2]},            //实验室id,查套餐列表。
   'lab/removeRecipeByIdAndLabId':  {t: true, cntType: CNT_TYPE[2]},        //实验室id,删除查套餐。
   'lab/removeDoctorAdviceByIdAndLabId':  {t: true, cntType: CNT_TYPE[2]}, //实验室id,删除查医嘱。

   'doctorAdvice/listByLabId':  {t: true, cntType: CNT_TYPE[2]},     //实验室id,查医嘱列表。
   'labDoctorAdvice/remove': {t: true, cntType: CNT_TYPE[2]},       //删除实验室选中的医嘱。
    /*---------- 实验室 - 项目 ------------------*/
   'labProject/listBylabId': {t: true, cntType: CNT_TYPE[2]},       //实验室labId，查选中的项目。

   /*----------- 仪器 ------------------*/
   'deviceType/list': {t: true, cntType: CNT_TYPE[2]},         //仪器分页列表。
   'deviceType/save': {t: true, cntType: CNT_TYPE[1]},               //仪器保存。
   'deviceType/remove': {t: true, cntType: CNT_TYPE[2]},             //仪器类型删除。
   'deviceType/listByDeviceTypeId': {t: true, cntType: CNT_TYPE[2]},         //仪器类型分页列表。
   'lab/removeByIdAndProjectId': {t: true, cntType: CNT_TYPE[2]},    //删除仪器对应的项目(仪器类型id和项目projectId)。

   /*----------- 工作组 ------------------*/
   'workGroup/save': {t: true, cntType: CNT_TYPE[1]},               //提交。
   'workGroup/list': {t: true, cntType: CNT_TYPE[2]},           //工作组列表
   'workgroup/remove': {t: true, cntType: CNT_TYPE[2]},         //删除
   'workGroupDetail/list':  {t: true, cntType: CNT_TYPE[2]},    //工作组详情

   /*----------- 机构 ------------------*/
   'area/list': {t: true, cntType: CNT_TYPE[2]},                    //中国、省市区。
   'org/save': {t: true, cntType: CNT_TYPE[1]},                     //机构保存。(类型特殊)
   'org/pageList': {t: true, cntType: CNT_TYPE[2]},                 //机构分页查询列表。
   'org/delete': {t: true, cntType: CNT_TYPE[2]},                   //机构删除。

   /*----------- 员工 ------------------*/
   'employee/save': {t: true, cntType: CNT_TYPE[1]},               //提交。
   'employee/pageList': {t: true, cntType: CNT_TYPE[2]},           //员工列表
   /*----------- 角色 ------------------*/
   'roleInfo/save': {t: true, cntType: CNT_TYPE[1]},                 //提交。
   'roleInfo/pageList': {t: true, cntType: CNT_TYPE[2]},             //角色列表
   /*----------- 产品 ------------------*/
   'product/save': {t: true, cntType: CNT_TYPE[1]},                  //提交。
   'product/pageList': {t: true, cntType: CNT_TYPE[2]},             //产品列表
   'product/delete': {t: true, cntType: CNT_TYPE[2]},               //产品删除
   /*----------- 部门 ------------------*/
   'department/save': {t: true, cntType: CNT_TYPE[1]},               //提交。
   //'department/pageList': {t: true, cntType: CNT_TYPE[2]},             //列表
   'org/pageList': {t: true, cntType: CNT_TYPE[2]},                  //展示机构部门列表

  /*----------- 套餐 ------------------*/
  'labRecipe/list': {t: true, cntType: CNT_TYPE[2]},           //套餐分页列表。
  'labRecipe/save': {t: true, cntType: CNT_TYPE[1]},                //套餐提交。
  'recipeDetails/list': {t: true, cntType: CNT_TYPE[2]},               //套餐提交。
  'doctorAdvice/listByRecipeId': {t: true, cntType: CNT_TYPE[2]},  //套餐查医嘱。
  'labRecipe/remove': {t: true, cntType: CNT_TYPE[2]},               //套餐删除。
  'doctorAdvice/listByRecipeId': {t: true, cntType: CNT_TYPE[2]},      //套餐查看已选医嘱分页列表。

  /*----------- 报告单 ------------------*/
  'labReportDetail/listByLabCode': {t: true, cntType: CNT_TYPE[2]},    //(实验室编号)查询实验室名称。

  /*----------- 统计 ------------------*/
  'labApplyBill/list': {t: true, cntType: CNT_TYPE[2]},         //申请单列表
  'labApplyBillDetail/list': {t: true, cntType: CNT_TYPE[2]},  //申请单详细列表
  'labReport/list': {t: true, cntType: CNT_TYPE[2]},            //报告单列表
  'labReportDetail/list': {t: true, cntType: CNT_TYPE[2]},     //报告单详细列表
  'labProject/pageListDetail': {t: true, cntType: CNT_TYPE[2]},       //项目详细列表
  /*----------- 数量-统计接口 ------------------*/
  'labCount/applyBillCount': {t: true, cntType: CNT_TYPE[2]},         //申请单数量统计。
  'labCount/applyBillMoney': {t: true, cntType: CNT_TYPE[2]},         //申请单金额统计。
  'labCount/reportCount': {t: true, cntType: CNT_TYPE[2]},            //报告单数量统计。
  /*----------- 趋势-统计接口 ----*/
  'lab/listAll': {t: true, cntType: CNT_TYPE[2]},                       //获取所有实验室。
  'labCount/applyBillEveryDayCount': {t: true, cntType: CNT_TYPE[2]}, //申请单数量统计。
  'labCount/applyBillEveryDayMoney': {t: true, cntType: CNT_TYPE[2]}, //申请单金额统计。
  'labCount/reportEveryDayCount': {t: true, cntType: CNT_TYPE[2]},    //报告单数量统计。
};

//项目token前缀：
const PREFIX = '_YZH_D';//设备管理
/* 保存用户信息到localStore */
const TOKEN = `${PREFIX}_Token`;                                                //token
const USER = `${PREFIX}_User`


const lsNames = {
    /*------- platform -------*/
    platform: {
      USER: USER,
      USER_ROLE: `${PREFIX}_User_Roles`                                         // 用户角色
    },
    /*--------- order ---------*/
    order: {
      AddOrderModalForm: `${PREFIX}_AddOrderModalForm`                       // 保存订单
    },
    /*--------- tms -----------*/
    tms: {

    }
};

export default {
  prefix: PREFIX,
  cntType: CNT_TYPE,
  url: URL,
  //uploadUrl: UPLOAD_URL,
  //ossFileUrl: OSS_FILE_URL,
  //repFileUrl: REP_FILE_URL,
  static_FILE_URL: STATIC_FILE_URL,
  lsNames,
  api: API,
  token: TOKEN,
  user: USER
}
