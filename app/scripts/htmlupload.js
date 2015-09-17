!function ($) {
    "use strict";

    var FileUploads = function (content, options) {
        var self = this;
        //调用HTML5上传组件
        this.$element = $(content);
        this.$upload = $('<span class="btn btn-default" style="position: relative; overflow: hidden; cursor: pointer;font-size:12px;">选择文件<input id="uploadFiles" name="files" type="file" multiple=""  style="border: none; opacity: 0; filter: alpha(opacity=0); position: absolute; top: 0; right: 0; width: 100%; bottom: 0; height: 100%; cursor: pointer;" accept="image/jpeg,.jpg,image/gif,.gif,image/png,.png,video/x-mpeg2,.mp4" /></span>');
        this.$element[0].parentNode.replaceChild(this.$upload[0], this.$element[0]);
        $('#uploadFiles').change($.proxy(self.fileHandler, self));
        //调用加载完成事件
        //this.swfupload_loaded_function();
    }
    FileUploads.prototype = {
        constructor: FileUploads,
        fileHandler:function(e){
            var queuedFiles = [];
            var selectFiles = e.delegateTarget.files;
            for (var i = 0; i < selectFiles.length; i++) {
                var file = selectFiles[i];
                queuedFiles.push({index:i, file:file});
            }
            //文件选择完成事件
            this.upload_start_function(queuedFiles[0]);
        },
        upload_start_function:function(file){
            var fd = new FormData();
            fd.append("Filedata", file.file);
            var xhr = this.createXHR();
            xhr.send(fd);
        },
        createXHR: function () {
            var xhr = new XMLHttpRequest();
            var timer;
            xhr.upload.addEventListener("progress", $.proxy(this._xhrProgress, this), false);
            xhr.addEventListener("load", $.proxy(this._xhrProgress, this), false);
            xhr.addEventListener("error", function (evt) {
                //this.onError(evt);
                //提示用户发生错误，开始下一次上传
                clearInterval(timer);
            }, false);
            xhr.addEventListener("abort", function (evt) {
                //this.onAbort(evt);
                clearInterval(timer);
            }, false);
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    clearInterval(timer);
                    try {
                        if (xhr.status == 200) {
                            //上传成功
                            alert('上传成功');
                        } else {
                            //上传失败
                            alert('上传失败');
                        }
                    } catch (e) {
                        var msg = "错误信息如下：";
                        console.error(msg, e);
                        console.error(xhr.responseText);
                    }
                }
            };
            xhr.open("POST", "http://localhost:8000/webservice/Handler.ashx");
            xhr.setRequestHeader("Accept", "application/json");
            return xhr;
        }
    };

    $.fn.HtmlFileUploads = function(option){
            var $this = $(this);
            var data = $this.data('HtmlFileUploads')
            var options = $.extend({}, $.fn.HtmlFileUploads.defaults, $this.data(), typeof option == 'object' && option);
            if (!data) {
                $this.data('HtmlFileUploads', (data = new FileUploads(this, options)));
            }
    };

    $.fn.HtmlFileUploads.defaults = {
        upload_url: "http://localhost:8000/webservice/Handler.ashx",
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
        button_window_mode: 'transparent'/*,
        swfupload_loaded_handler: this.swfupload_loaded_function,
        file_dialog_start_handler: this.file_dialog_start_function,
        file_queued_handler: this.file_queued_function,
        file_queue_error_handler: this.file_queue_error_function,
        file_dialog_complete_handler: this.file_dialog_complete_function,
        upload_start_handler: this.upload_start_function,
        upload_progress_handler: this.upload_progress_function,
        upload_error_handler: this.upload_error_function,
        upload_success_handler: this.upload_success_function,
        upload_complete_handler: this.upload_complete_function*/
    }

}(window.jQuery);
