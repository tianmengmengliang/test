import { menusData, returnMenuDataByUserRoles, getSpecificActionIds } from './menuSliderData.js'
import MenuSlider from './MenuSlider.jsx'
MenuSlider.menuData = menusData;

export {
    MenuSlider,
    returnMenuDataByUserRoles,
    getSpecificActionIds
}

export default MenuSlider;