import React, {  Component} from 'react';
import $ from 'jquery';
import Cropper from 'react-cropper';
//import 'cropperjs/dist/cropper.css';
import styles from 'cropperjs/dist/cropper.css';

class CropBox extends Component {
	constructor(props) {
		super(props);

		this.state = {
	      src: '',
	      close: this.props.close ? this.props.close : true,
	      url: this.props.url ? this.props.url : '',
	      uploadData: this.props.uploadData ? this.props.uploadData : {},
	      aspectRatio: this.props.aspectRatio ? this.props.aspectRatio : ''
	    }

	    this.onChange = this.onChange.bind(this);
	    this.cropImage = this.cropImage.bind(this);
	    this.convertBase64UrlToBlob = this.convertBase64UrlToBlob.bind(this);
	    this.submitUpload = this.submitUpload.bind(this);
	    this.closeBox = this.closeBox.bind(this);
	}

	componentWillReceiveProps(nextProps) {
      this.setState({
         close: nextProps.close,
      });
  }

	onChange(e) {
	    e.preventDefault();
	    let files;
	    if (e.dataTransfer) {
	      	files = e.dataTransfer.files;
	    } else if (e.target) {
	      	files = e.target.files;
	    }
	    let reader = new FileReader(); //????????
	    reader.onload = () => {
	      this.setState({
	        src: reader.result,
	      });
	    };
	    reader.readAsDataURL(files[0]);
	}

  //----------------------------- start 提交 -------------------------------------
	cropImage() {
	    if (typeof this.cropper.getCroppedCanvas() === 'undefined') {
	      return;
	    }

	    let img64Data = this.cropper.getCroppedCanvas().toDataURL();
	    let imgblobDate = this.convertBase64UrlToBlob(img64Data);
	    this.submitUpload(imgblobDate);
	}

	submitUpload(imgBlob) {
		let _this = this;
		let fd = new FormData();
		fd.append('file', imgBlob);
		for(let key in this.state.uploadData) {
			fd.append(key, this.state.uploadData[key]);
		}
    console.log('提交fd',fd);
		/*
		$.ajax({
		    url: this.state.url,
		    type: 'POST',
		    data: fd,
		    contentType: false,
		    processData: false,
		    dataType: 'json',
		    success: function (data) {
	    		console.log(data.result);
	    		if(_this.props.getUrl) {
	    			_this.props.getUrl(data.result);
	    		}
	    		_this.setState({
	    			close: true,
	    			src: ''
	    		})
		    },
		    error: function(err) {
		    	console.log(err);
		    }
		});*/
	}


	//base64 转 二进制文件格式
	convertBase64UrlToBlob(urlData) {
		var bytes = window.atob( urlData.split(',')[1]);        //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }
    return new Blob( [ab], {type : 'image/png'});
	}
  //----------------------------- end ---------------------------------------

	closeBox() {
		this.setState({
			close: true
		})
	}

	render() {
		return (
			<div className ={styles["crop-box"]} style={this.state.close ? {"display": "none"} : {"display": "block"}}>
				<div className={styles["crop-box-bg"]}></div>
				<div className={styles["crop-box-content"]}>
					<div className={styles["crop-input"]}>
						<input type="file" onChange={this.onChange} />
						<div className={styles["crop-close"]} onClick = {this.closeBox}>关闭</div>
					</div>

					<div className={styles["crop-area"]}>
						<Cropper
				        style={{ height: 400, width: 400 }}
						    aspectRatio = {this.state.aspectRatio}
						    preview= ".img-preview"
                guides={true}
                src={this.state.src}
                ref={cropper => { this.cropper = cropper; }}
            />
					</div>
					<button className={styles["crop-sure-btn"]} onClick={this.cropImage}>确认裁剪</button>
				</div>
			</div>
		);
	}
}

export default CropBox;
