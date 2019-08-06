
/**
 * module: ObjectUtilities工具类
 * @module templates/ObjectUtilities
 * @author lh
 * @since 2017-10-19
 * @version 1.0.0
 * */

/**
 * module: ObjectUtilities工具类
 * @class
 * @extends Object
 * */
class ObjectUtilities extends Object{

  /**
   * ObjectUtilities的构造方法
   * @constructs ComponentTemplate
   * @params { object } props - 实例属性
   * */
  constructor(props) {
    super(props);
  }

  /**
   * @member { function } 浅比较两个对象的属性是否发生变化
   * @param { object } target - 第一个比较的对象
   * @param { object } target2 - 第二个比较的对象
   * @return { boolean } true: 两个对象一样
   * @static
   * @readonly
   * */

  static equal(target, target2) {
    let r = true;
    for (const prop in target) {
      if (typeof target[prop] === 'function' && typeof target2[prop] === 'function') {
        if (target[prop].toString() != target2[prop].toString()) {
          r = false;
        }
      } else if (target[prop] != target2[prop]) {
        r = false;
      }
    }
    return r;
  }

  /*
  * @member 去除参数对象的undefined和null值
  * @param {any} 参数对象
  * @return {any} 去除参数对象的undefined和null的新的对象
  * @static
  * @readonly
  * */
  static dislodge(options){
    if(typeof options === 'object'){
      let _newOptions = options instanceof Array ? [] : {};
      const keys = Object.keys(options);
      keys.forEach((key)=>{
        if(options[key] !== undefined || options[key] !== null){
          _newOptions[key] = options[key]
        }
      });
      return _newOptions
    }
  }

}

/**
 * 导出 ObjectUtilities工具类
 * @exports ObjectUtilities
 * @default ObjectUtilities
 * */
export default ObjectUtilities;
