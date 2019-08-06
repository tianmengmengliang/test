/**
 * Created by jpt on 2018/5/16 0016.
 */
//import area from './area.js'
//从 session 中取得 area。
import BasicLayout from '../../layouts/BasicLayout.js'
const {Dic_listkey } = BasicLayout.area_key ;
const _area = sessionStorage.getItem( Dic_listkey);
let list = JSON.parse( _area); //字符串转JSON

/*
 * @interface 根据模块name，返回模块。
 * @provinceId {string} 设备类型的id
 * @return {Array.object} 返回类型的对象
 * */
export function searchTextByValues(name){
  //console.log('字典表list',list);
  // console.log('name', name);
  if(!name) return [];
  //1.找到模块
  let _id = 0;

  if(list instanceof Array && list.length>0){ //判断是数组类型 && 不是空数组。
    list.map((item)=>{
      if(item.name === name){
        _id = item.id;
      }
    })
    //console.log('模块id', _id);
  }


  function loop(id, arr){
    if(!id||!arr) return {};
    let array = [];
    try{
      for(var i=0, len = arr.length; i<len;i++){
        if(arr[i].parentId == id) {
          //console.log('3匹配');
          //return arr[i]
          array.push(arr[i]);
        }
      }
      return array;
    }catch(e){
      console.log(e)
    }
    return {};
  }

  var location =[];
  location = loop(_id, list);
  return location
}
