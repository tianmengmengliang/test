import React, {Component} from 'react';
import CropBox from './cropBox.jsx';
//import './crop.css';
import styles from './crop.css';

class CropBlock extends Component {

	constructor(props) {
		super(props);
		this.state = {
			urlArr: this.props.imgArr ? this.props.imgArr : [],
			number: this.props.number ? this.props.number : '',
			uploadData: this.props.uploadData ? this.props.uploadData : {},
			aspectRatio: this.props.aspectRatio ? this.props.aspectRatio : '',
			url: this.props.url ? this.props.url : '',
			close: true,
		}

		this.getUrl = this.getUrl.bind(this);
		this.addImg = this.addImg.bind(this);
		this.delImg = this.delImg.bind(this);
		this.getAllImg = this.getAllImg.bind(this);
	}

	getUrl(url) {
		let urlArr2 = this.state.urlArr;
		urlArr2.push(url);
		this.setState({
			urlArr: urlArr2,
			close: true
		})
		this.getAllImg(urlArr2);
	}

	addImg() {
		if(!this.state.number || (this.state.urlArr.length < this.state.number)) {
			this.setState({
				close: false
			})
		}
		else {
			alert("最多上传"+ this.state.number+"张图片！");
		}
	}

	delImg(index) {
    const {urlArr, } = this.state;
		if(window.confirm("你确定要删除改图片吗")) {
			let urlArr2 = urlArr;
			urlArr2.splice(index, 1);
			this.setState({
				urlArr: urlArr2,
				close: true
			})
			this.getAllImg(urlArr2);
		}
	}

	getAllImg(urlArr) {
		if(this.props.getAllImg) {
			this.props.getAllImg(urlArr);
		}
	}

	render() {
    const {urlArr, uploadData,aspectRatio,url, close} = this.state;

		let imgList = urlArr.map((item, index) =>
			<div key={index} className={styles['crop-img-block']}>
				<img className={styles["crop-img"]} title ="删除" alt="图片"
             src={item}
             onClick={this.delImg.bind(this, index)} />
			</div>
		)

		return (
			<div className={styles["crop-block"]}>
			    {imgList}
				<div className={styles["crop-add-img"]} onClick={this.addImg}>添加图片</div>
				<CropBox
					getUrl={this.getUrl}
					uploadData={uploadData}
					aspectRatio={aspectRatio}
					url={url}
					close={close}/>
			</div>
		)
	}
}

export default CropBlock;
