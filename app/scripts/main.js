!function ($) {
    "use strict";

    var FileInput = function (content, options) {
        var self = this;
        //判断浏览器是否支持HTML5
        var e = document.createElement('script');
        e['type'] = 'text/javascript';
        /*if (window.File && window.FileReader && window.FileList && window.Blob) {
            //调用Flash上传组件，动态加载js文件
            e['src'] = 'scripts/htmluploads.js';
            e['onload'] = function () {
                self.initHtmlUpload(options);
            };
            e['onreadystatechange'] = function () {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    self.initHtmlUpload(options);
                }
            }
        }else{
            */
            //调用Flash上传组件，动态加载js文件
            e['src'] = 'scripts/swfupload.js';
            e['onload'] = function () {
                self.initFlashUpload(options);
            };
            e['onreadystatechange'] = function () {
                if (this.readyState === 'loaded' || this.readyState === 'complete') {
                    self.initFlashUpload(options);
                }
            }
        //}
        document.getElementsByTagName('head')[0].appendChild(e);
    }
    FileInput.prototype = {
        constructor: FileInput,
        initFlashUpload:function(options){
            if(window.SWFUpload && document.getElementById(options.button_placeholder_id)){
                new SWFUpload(options);
            }
        },
        initHtmlUpload:function(options){
            if($.fn.customFileUploads && document.getElementById(options.button_placeholder_id)){
                $().customFileUploads(options);
            }
        }
    };

    $.fn.customFileInput = function(option){
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('customFileInput')
            var options = $.extend({}, $.fn.customFileInput.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('customFileInput', (data = new FileInput(this, options)));
            }
        })
    };

    $.fn.customFileInput.defaults = {
        swfupload_loaded_handler: swfupload_loaded_function,
        file_dialog_start_handler: file_dialog_start_function,
        file_queued_handler: file_queued_function,
        file_queue_error_handler: file_queue_error_function,
        file_dialog_complete_handler: file_dialog_complete_function,
        upload_start_handler: upload_start_function,
        upload_progress_handler: upload_progress_function,
        upload_error_handler: upload_error_function,
        upload_success_handler: upload_success_function,
        upload_complete_handler: upload_complete_function
    }
    function swfupload_loaded_function(){
        console.log('加载完成');
    }
    function file_dialog_start_function(){
        console.log('将打开文件选择窗口');
    }
    function file_queued_function(file){
        console.log("文件" + file.name + "正确压入队列！");
    }
    function file_queue_error_function(file, errorCode, message){
        console.log("文件" + file.name + "错误压入队列！");
    }
    function file_dialog_complete_function(numFilesSelected, numFilesQueued){
        try {
            if (numFilesQueued > 0) {
                this.startUpload();
            }
            if (numFilesSelected > numFilesQueued) {
                alert("有" + (numFilesSelected - numFilesQueued) + "个文件大于40M，已被忽略!");
            }
        } catch (ex) {
            //this.debug(ex);
        }
    }
    function upload_start_function(file){
        console.log('上传开始' + file.name);
    }
    function upload_progress_function(file, bytesLoaded){
        var percent = Math.ceil((bytesLoaded / file.size) * 100);
        console.log(file.name + "已上传" + percent + "%");
    }
    function upload_error_function(file, errorCode, message){
        //alert('上传失败');
        alert("文件" + file.name + "上传失败，错误码：" + errorCode + ",错误信息：" + message);
    }
    function upload_success_function(file, serverData){
        try {
            console.log(file.name + "服务器文件名为：" + serverData);
                //将原文件名file.name和新文件名serverData保存到数据库
                //先保存下来，等全部上传成功后再提交到数据库
            //uploadedFiles.push({ OLD: file.name, NEW: serverData });
        } catch (ex) {
            this.debug(ex);
        }
    }
    function upload_complete_function(file){
        try {
            if (this.getStats().files_queued > 0) {
                this.startUpload();
            } else {
            }
        }catch (ex) {
            alert(ex);
        }
    }
}(window.jQuery);


$('#File').customFileInput({
    upload_url: "http://localhost:8080/Handler.ashx",
    flash_url: "scripts/swfupload.swf",
    file_post_name: "Filedata",
    post_params: {
        "post_param_name_1": "post_param_value_1",
        "post_param_name_2": "post_param_value_2",
        "post_param_name_n": "post_param_value_n"
    },
    use_query_string: false,
    requeue_on_error: false,
    http_success: [201, 202],
    assume_success_timeout: 0,
    file_types: "*.jpg;*.gif;*.png",
    file_types_description: "图片及视频文件",
    file_size_limit: "40980",//最大40M
    file_upload_limit: 10,
    file_queue_limit: 0,
    debug: false,
    prevent_swf_caching: false,
    preserve_relative_urls: false,
    button_placeholder_id: 'File',
    button_image_url: "",
    button_width: 82,
    button_height: 34,
    button_text: "上传附件",
    button_text_style: "color:#FFF;height:50px;width:112px;",
    button_text_left_padding: 3,
    button_text_top_padding: 2,
    button_action: -110,
    button_disabled: false,
    button_cursor: -2,
    button_window_mode: 'transparent'
});