// ReitsukiSion
// MIT License
CKEDITOR.plugins.add( 'ckeImagePaste',
{
	init : function( editor )
	{

		function uploadImage(fileName, file, callback){
			var url= editor.config.filebrowserImageUploadUrl + '?CKEditor=' + editor.name + '&CKEditorFuncNum=2&langCode=' + editor.langCode;
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.onload = function(){
                var body = xhr.responseText;
                var imgURL = body.match(/2,\s*'(.*?)',/)[1];
                callback(imgURL);
            };
            var fr = new FormData();
            fr.append("upload",file,fileName); 
            xhr.send(fr);
        }


        function getExtName(mime){
            return mime.split("/")[1];
        }


        function dataURLToBlob(dataURL){
            var BASE64_MARKER = ';base64,';
            if (dataURL.indexOf(BASE64_MARKER) == -1) {
              var parts = dataURL.split(',');
              var contentType = parts[0].split(':')[1];
              var raw = parts[1];

              return new Blob([raw], {type: contentType});
            }

            var parts = dataURL.split(BASE64_MARKER);
            var contentType = parts[0].split(':')[1];
            var raw = window.atob(parts[1]);
            var rawLength = raw.length;

            var uInt8Array = new Uint8Array(rawLength);

            for (var i = 0; i < rawLength; ++i) {
              uInt8Array[i] = raw.charCodeAt(i);
            }

            return new Blob([uInt8Array], {type: contentType});
        }


		function pasteEvent (e){
			if(CKEDITOR.env.webkit){
				console.log(e);
				var ev = e.data.$;
				var file =  ev.clipboardData.items[0].getAsFile();
				if(file === null || file.type.indexOf("image/") !== 0){
					return;
				}

				var reader = new FileReader()
				reader.onload = function(evt){
                    var id = CKEDITOR.tools.getNextId();
					var img = editor.document.createElement("img");
					img.setAttribute("src",evt.target.result);
					editor.insertElement(img);
					// 上传图片
                    var fileName = id + "." + getExtName(file.type);
					uploadImage(fileName,file,function(url){
                        img.setAttribute("src",url);
                    });
				};

				reader.readAsDataURL(file);
			}else{
                // 火狐或者其他浏览器
                var data = e.data;
                var html = (data.html || ( data.type && data.type=='html' && data.dataValue));
                if(!html){
                    return;
                }

                var id = CKEDITOR.tools.getNextId();
                html = html.replace( /<img src="data:image\/png;base64,.*?" alt="">/g, function( img ){
                    var imgDataUrl = img.match(/src=\"(.*?)\"/)[1];
                    var file = dataURLToBlob(imgDataUrl);
                    var fileName = id + "." + getExtName(file.type);
                    // 上传图片
                    // 
                    uploadImage(fileName,file,function(url){
                        var imgObj = editor.document.getById(id);
                        imgObj.setAttribute( 'src', url);
                        imgObj.data( 'cke-saved-src', url);
                    });


                    return img.replace(/>/, ' id="' + id + '">')
                });

                if (e.data.html){
                    e.data.html = html;
                }
                else{
                    e.data.dataValue = html;
                }
            }
		}

		if(CKEDITOR.env.webkit){
			editor.on("instanceReady",function(){
				editor.document.on("paste",pasteEvent);
			});
		}else{
			editor.on('paste',pasteEvent);
		}


	} //Init
} );
