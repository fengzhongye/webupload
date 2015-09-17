;(function($) {
    var selectedFiles = [], queuedFiles = [], index = 0;
    //定义HTML5上传组件的构造函数
    function guid(){
        var S4 = function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
    }
    var File = function(source){
        //文件名
        this.name = source.name || 'Untitled';
        //文件大小
        this.size = source.size || 0;
        //文件MIMETYPE类型
        this.type = source.type || 'application/octet-stream';
        //文件最后修改日期
        this.lastModifiedDate = source.lastModifiedDate || (new Date() * 1);
        //文件ID，每个文件对应一个唯一的ID
        this.index = guid();
        //文件扩展名
        this.ext = /\.([^.]+)$/.exec( this.name ) ? RegExp.$1 : '';
        //文件状态
        this.statusText = '';
        // 存储文件状态，防止通过属性直接修改
        this.source = source;
        this.loaded = 0;
    }
    File.prototype = {
        //获取文件原始信息
        getSource: function() {
            return this.source;
        }
    }
    var FileUploadsHtml = function(ele, opt) {
        this.$element = ele;
        this.defaults = {};
        this.options = $.extend({}, this.defaults, opt);
        try{
            this.initSettings();
            this.$upload = $('<span class="btn btn-default" style="position: relative; overflow: hidden; cursor: pointer;font-size:12px;">选择文件<input id="uploadFiles" name="files" type="file" multiple=""  style="border: none; opacity: 0; filter: alpha(opacity=0); position: absolute; top: 0; right: 0; width: 100%; bottom: 0; height: 100%; cursor: pointer;" accept="image/jpeg,.jpg,image/gif,.gif,image/png,.png" /></span>');
            this.$element = $("#"+this.options.button_placeholder_id)[0];
            this.$element.parentNode.replaceChild(this.$upload[0], this.$element);
            $('#uploadFiles').click($.proxy(this.fileUploadStart, this));
            $('#uploadFiles').change($.proxy(this.fileHandler, this));
            //上传组件初始化成功事件
            this.options.swfupload_loaded_handler();
        }catch (ex) {
            alert('服务器地址错误，请检查后重试！');
            throw ex;
        }
    }

    FileUploadsHtml.version = "2.2.0 2009-03-25";
    FileUploadsHtml.BUTTON_ACTION = {
        SELECT_FILE  : -100,
        SELECT_FILES : -110,
        START_UPLOAD : -120
    };
    FileUploadsHtml.QUEUE_ERROR = {
        QUEUE_LIMIT_EXCEEDED            : -100,
        FILE_EXCEEDS_SIZE_LIMIT         : -110,
        ZERO_BYTE_FILE                  : -120,
        INVALID_FILETYPE                : -130
    };
    FileUploadsHtml.UPLOAD_ERROR = {
        HTTP_ERROR                      : -200,
        MISSING_UPLOAD_URL              : -210,
        IO_ERROR                        : -220,
        SECURITY_ERROR                  : -230,
        UPLOAD_LIMIT_EXCEEDED           : -240,
        UPLOAD_FAILED                   : -250,
        SPECIFIED_FILE_ID_NOT_FOUND     : -260,
        FILE_VALIDATION_FAILED          : -270,
        FILE_CANCELLED                  : -280,
        UPLOAD_STOPPED                  : -290
    };
    FileUploadsHtml.FILE_STATUS = {
        QUEUED       : -1,
        IN_PROGRESS  : -2,
        ERROR        : -3,
        COMPLETE     : -4,
        CANCELLED    : -5
    };
    FileUploadsHtml.CURSOR = {
        ARROW : -1,
        HAND : -2
    };
    FileUploadsHtml.WINDOW_MODE = {
        WINDOW : "window",
        TRANSPARENT : "transparent",
        OPAQUE : "opaque"
    };

    FileUploadsHtml.prototype = {
        constructor: FileUploadsHtml,
        completeURL:function(url) {
            if (typeof(url) !== "string" || url.match(/^https?:\/\//i) || url.match(/^\//)) {
                return url;
            }
            var currentURL = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : "");
            var indexSlash = window.location.pathname.lastIndexOf("/");
            if (indexSlash <= 0) {
                path = "/";
            } else {
                path = window.location.pathname.substr(0, indexSlash) + "/";
            }
            return path + url;
        },
        initSettings:function(){
            this.ensureDefault = function (settingName, defaultValue) {
                this.options[settingName] = (this.options[settingName] == undefined) ? defaultValue : this.options[settingName];
            };
            this.ensureDefault("upload_url", "");
            this.ensureDefault("preserve_relative_urls", false);
            this.ensureDefault("file_post_name", "Filedata");
            this.ensureDefault("post_params", {});
            this.ensureDefault("use_query_string", false);
            this.ensureDefault("requeue_on_error", false);
            this.ensureDefault("http_success", []);
            this.ensureDefault("assume_success_timeout", 0);
            this.ensureDefault("file_types", "*.*");
            this.ensureDefault("file_types_description", "All Files");
            this.ensureDefault("file_size_limit", 0);   // Default zero means "unlimited"
            this.ensureDefault("file_upload_limit", 0);
            this.ensureDefault("file_queue_limit", 0);
            this.ensureDefault("flash_url", "swfupload.swf");
            this.ensureDefault("prevent_swf_caching", true);
            this.ensureDefault("button_image_url", "");
            this.ensureDefault("button_width", 1);
            this.ensureDefault("button_height", 1);
            this.ensureDefault("button_text", "");
            this.ensureDefault("button_text_style", "color: #FFF; font-size: 12px;");
            this.ensureDefault("button_text_top_padding", 0);
            this.ensureDefault("button_text_left_padding", 0);
            this.ensureDefault("button_action", FileUploadsHtml.BUTTON_ACTION.SELECT_FILES);
            this.ensureDefault("button_disabled", false);
            this.ensureDefault("button_placeholder_id", "");
            this.ensureDefault("button_placeholder", null);
            this.ensureDefault("button_cursor", null);
            this.ensureDefault("button_window_mode", null);
            this.ensureDefault("debug", false);
            this.ensureDefault("swfupload_loaded_handler", null);
            this.ensureDefault("file_dialog_start_handler", null);
            this.ensureDefault("file_queued_handler", null);
            this.ensureDefault("file_queue_error_handler", null);
            this.ensureDefault("file_dialog_complete_handler", null);
            this.ensureDefault("upload_start_handler", null);
            this.ensureDefault("upload_progress_handler", null);
            this.ensureDefault("upload_error_handler", null);
            this.ensureDefault("upload_success_handler", null);
            this.ensureDefault("upload_complete_handler", null);
            this.ensureDefault("debug_handler", this.debugMessage);
            if (!this.options.preserve_relative_urls) {
                this.options.upload_url = this.completeURL(this.options.upload_url);
            }
            delete this.ensureDefault;
        },

        fileUploadStart:function(e){
            //窗口打开事件
            this.options.file_dialog_start_handler(e);
        },
        fileHandler:function(e){
            selectedFiles = [];
            index = 0;
            var selectFiles = e.delegateTarget.files;
            for (var i = 0; i < selectFiles.length; i++) {
                var file = selectFiles[i];
                if(file.size <= parseInt(this.options.file_size_limit, 10) * 1024){
                    var queueFile = new File(file);
                    queuedFiles.push(queueFile);
                    this.options.file_queued_handler(queueFile);
                }else{
                    this.options.file_queue_error_handler(new File(file));
                }
                selectedFiles.push(new File(file));
            }
            this.xhr = this.createXHR();
            //文件选择完成事件
            this.dialogCompleteHandler();
        },
        dialogCompleteHandler:function(){
            this.options.file_dialog_complete_handler.call(this, selectedFiles.length, queuedFiles.length);
        },
        startUpload:function(){
            this.upload_start_function(queuedFiles[index]);
        },
        upload_start_function:function(file){
            this.options.upload_start_handler(file);
            var fd = new FormData();
            fd.append("Filedata", file.getSource());
            this.xhr.open("POST", this.options.upload_url);
            this.xhr.setRequestHeader("Accept", "application/json");
            this.xhr.send(fd);
        },
        _xhrProgress: function (evt) {
            if (evt.lengthComputable) {
                var o = {
                    bytesLoaded: evt.loaded,
                    bytesTotal: evt.total,
                    type: evt.type,
                    timeStamp: evt.timeStamp
                };
                if (evt.type == "load") {
                    o.percent = "100%";
                    o.decimal = 1;
                } else {
                    o.decimal = evt.loaded / evt.total;
                    o.percent = Math.ceil((evt.loaded / evt.total) * 100);
                }
                this.options.upload_progress_handler(queuedFiles[index], o.bytesLoaded);
                console.log("文件" + queuedFiles[index].name + "已上传：" + o.percent + "%");
            }
        },
        getStats:function(){
            return {
                files_queued:queuedFiles.length
            };
        },
        createXHR: function () {
            var xhr = new XMLHttpRequest();
            var self = this;
            var timer;
            xhr.upload.addEventListener("progress", $.proxy(this._xhrProgress, this), false);
            xhr.addEventListener("load", $.proxy(this._xhrProgress, this), false);
            xhr.addEventListener("error", function (evt) {
                //this.onError(evt);
                //文件上传失败事件
                self.options.upload_error_handler(queuedFiles[index], FileUploadsHtml.UPLOAD_ERROR.SECURITY_ERROR, '不支持跨域上传文件！');
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
                            var file = queuedFiles[index];
                            queuedFiles = queuedFiles.slice(1);
                            self.options.upload_success_handler(file, xhr.responseText);
                            self.options.upload_complete_handler.call(self, file);
                        } else {
                            //上传失败
                            //self.options.upload_error_handler(file, errorCode, message);
                        }
                    } catch (e) {
                        //self.options.upload_error_handler(file, errorCode, message);
                    }
                }
            };
            return xhr;
        }
    }
    $.fn.customFileUploads = function(options) {
        return new FileUploadsHtml(this, options);
    }
})(jQuery);