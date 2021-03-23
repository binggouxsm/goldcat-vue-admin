(function($){
    $.ajaxSetup({
        cache: false
    });
    $.fn.extend({
        formForbidden: function() {
            var $this = $(this);
            var elements = $this[0].elements;
            var isIE = $.browser().isIE;
            for(var i in elements){
            	
                var ele = elements[i],
                    tagName = ele.tagName ? ele.tagName.toUpperCase(): null;
                
                switch(tagName){
                    case 'INPUT':
                        var type = ele.type;
                        if (type === 'radio' || type === 'checkbox') {
                            ele.disabled = true;
                        }else {
                            ele.setAttribute('readonly', 'readonly');
                            // isIE && ele.setAttribute('unselectable', 'on');
                        }
                        break;
                    case 'SELECT':
                    case 'TEXTAREA':
                        ele.disabled = true;
                        break;
                }
            }
            $this.find('input').attr('readonly', true);
            $this.find('select').attr('disabled', true);
            $this.find('textarea').attr('disabled', true);
            isIE && $this.find('.icheckbox').iCheck('disable');

        },
        checkInfo: function(max) {
            if (typeof(max) !== 'number' &&  max <= 3) {
                return
            }
            var $this = $(this),
                text = $this.text(),
                len = text.length,
                maxlen = max || 10;

            if (len <= maxlen) return;
            
            $(this).text(text.substring(0, maxlen-3)+'...');

            $this.on('click', function() {
                $('#info-html-modal').modal('show').find('.modal-body').text(text);
            })

        },
        autoComplete:function(){
            var $this = $(this),
                $parent = $('<div>').addClass('better-autocomplete');
            $this.wrapAll($parent);
            var $parent = $this.closest('.better-autocomplete');
            var once =false,
                Left = $parent.css('padding-left'),
                Height = $this.height() + parseInt($this.css('padding-top'))*2,
                width = $this.width(),
                url = $this.data('url'),
                maxlength = $this.data('max-length');
            $parent.on('keyup', '.autoComplete', function(){
                throttle(handleComplete, 500);
            }).on('click','.ui-text', function(){
                $this.val($(this).text());
                $(this).parent().addClass('selected').siblings().removeClass('selected');
                $(this).parents('.ui-autocomplete').css('display', 'none');
            }).on('focus', '.autoComplete', function(){
                $parent.find('.ui-autocomplete').css('display', 'block');
                if(once){
                    throttle(handleComplete, 500);
                    once=true;
                }
            }).on('blur', '.autoComplete', function(){
                setTimeout(function(){
                    $parent.find('.ui-autocomplete').css('display', 'none');
                },200)
            })
            function handleComplete() {
                var keyword = $.trim($this.val()),
                    len = countLength(keyword),
                    $error = $parent.find('.autocompleteErr');

                if (!keyword) {
                    $parent.find('.ui-autocomplete').addClass('hidden');
                    return;
                } else {
                    $parent.find('.ui-autocomplete').removeClass('hidden');
                }
                if (len > 100 ) {
                    if($error.size() > 0) {
                        $error.removeClass('hidden');
                    } else {
                        var errMessage = '<li class="text-center text-danger autocompleteErr"><i class="fa fa-info-circle" style="margin-right:5px;"></i>关键词长度不能超过100个字符</li>'
                        $parent.find('.ui-autocomplete').empty().append(errMessage);
                    }
                    return;
                } else {
                    if($error.size() > 0) {
                        $error.addClass('hidden');
                    }
                }
                $.req(url, {keyword:keyword}, function(data) {
                        data = JSON.parse(data).keywords;
                        var $ul = $('<ul></ul>').addClass('ui-autocomplete'),
                            li = '';
                        var len = maxlength || 10;
                        if(data.length>len){
                            data=data.slice(0,len);
                        }
                        for (var i in data) {
                            li += '<li class="ui-menu-item" role="presentation"><a class="ui-text" tabindex="-1">'+data[i]+'</a></li>';
                        }
                        if(li === ''){
                            li += '<li class="text-warning text-center"><i class="fa fa-warning"></i>&nbsp;&nbsp;没有对应的搜索结果！</li>'
                        }
                        $ul.css({
                            'left': Left,
                            'top': Height,
                            'width': width + 18
                        }).append(li);
                        $parent.find('.ui-autocomplete').remove();
                        $parent.append($ul);
                    }
                )
            }
            function throttle(method, delay, context) {
                clearTimeout(method.tId);
                method.tId=setTimeout(function(){
                    method.call(context);
                },delay)
            }
            function countLength(val) {
                var len = 0;
                for (var i = 0; i < val.length; i++) {
                    var countCode = val.charCodeAt(i);
                    if (countCode >=0 && countCode <= 128) {
                        len++;
                    }else {
                        len += 2;
                    }
                }
                return len;
            }
        },
        selectAuto: function() {
            var $this = this;
            if (this[0]._selectauto) return;
            this[0]._selectauto = true;
            var $this = $(this);
            var url = $this.data('url'),
                isMulti = $this.attr('multiple'),
                len = parseInt($this.data('max-length')) || 10;

            if (!url) return;
            var $searchbox = $this.siblings().find('.bs-searchbox');
            $searchbox.find('.search').remove();
            $searchbox.append('<input type="text" class="form-control search" autocomplete="off">');
            var $search = $searchbox.find('.search');

            var event = $.browser().isIE8OrLower ? 'propertychange' : 'input';
            $this.siblings('.dropdown-menu').append('<div class="footer" style="margin:5px 0 -5px;"><a class="btn btn-danger clear" href="#">清空</a><div> ')
                .on('click', '.clear', function(){
                    $this.selectpicker('val', '');
                })
            $search.on(event, function(){
                throttle(selectAuto, 200);
            })

            if($.browser().isIE9){
                $search.on('keyup', function(e){
                    e.keyCode === 8 && throttle(selectAuto, 200);
                })
            }

            if(isMulti){
                $this.on('changed.bs.select', function(e, clickindex){
                    var $select = $this,
                    $compare = $select.find('optgroup:eq(0)'),
                    $clickoption = $select.find('option:eq('+clickindex+')'),
                    clicklVal = $clickoption.val(),
                    group = $clickoption.parent().index();

                    if (group === 1) {
                        var exist = false;
                        $compare.children().each(function(){
                            ($(this).val() === clicklVal) && (exist = true);
                        })
                        if (exist) {
                            $.message('warning', '当前选项已存在！');
                            $clickoption.attr('selected', false);
                        } else {
                            var _thisDom = $clickoption.clone(true).attr('selected', true);
                            $clickoption.remove();
                            $select.find('optgroup:eq(0)').prepend(_thisDom);
                        }
                        $select.selectpicker('refresh');
                    }
                })

            }

            var time = 0, listData = [];
            function selectAuto() {
                time++;
                var self = time;
                var keyword = $search.val();
                var url = $this.attr('data-url');
                $.req(url+keyword, {}, function(data) {
                    listData[self-1] = 1;
                    if (self < listData.length) return;
                    var data = JSON.parse(data);
                    if(data.length > len){
                        data = data.slice(0,len);
                    }
                    var options = '';
                    if(data.length === 0) {
                        options = '<option disabled>无匹配结果项</option>';
                    } else {
                        for (var i in data) {
                            options += '<option data-tid="'+data[i].tid+'" value="'+data[i].id+'">'+data[i].id+'&nbsp;&nbsp;'+data[i].info+'</option>';
                        }
                    }
                    if(options){
                        var $opts = isMulti ? $('.add', $this) : $this;
                        $opts.empty().append(options);
                        $this.selectpicker('refresh');
                    }
                })
            }
            
            function throttle(method, delay, context) {
                clearTimeout(method.tId);
                method.tId=setTimeout(function(){
                    method.call(context);
                },delay)
            }
        },
        serializeTrim: function(req) {
            var formData = this.serializeArrayTrim();
            var $tree = this.find('input.tree');
            if ($tree.size()>0) {
                $tree.each(function(){
                    var $this = $(this);
                    var val = $this.attr('data-id') || $this.val(),
                        name = $this.attr('name');
                    for(var i in formData) {
                       if (formData[i].name === name && !formData[i].exist) {
                            formData[i].value = val;
                            formData[i].exist = true;
                            break;
                       }
                    }
                })
            }
            // 对于get 请求进行两次加密，后台进行一次解密
            if (req && req.toUpperCase() =='GET' && jQuery.isArray( formData )){
                jQuery.each( formData, function() {
                    this.value = encodeURIComponent(this.value);
                });
            }
            return $.param( formData );
        },
        serializeArrayTrim: function() {
            var rinput = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
                rselectTextarea = /^(?:select|textarea)/i,
                rCRLF = /\r?\n/g;
            
            return this.map(function(){
                return this.elements ? jQuery.makeArray( this.elements ) : this;
            })
            .filter(function(){
                return this.name &&
                    ( this.checked || rselectTextarea.test( this.nodeName ) ||
                        rinput.test( this.type ) );
            })
            .map(function( i, elem ){
                var val = jQuery( this ).val();

                return val == null ?
                    null :
                    jQuery.isArray( val ) ?
                        jQuery.map( val, function( val, i ){
                            return { name: elem.name, value: val.replace( rCRLF, "\r\n" ).replace(/^\s+|\s+$/g, "") };
                        }) :
                        { name: elem.name, value: val.replace( rCRLF, "\r\n" ).replace(/^\s+|\s+$/g, "") };
            }).get();
        },
        serializeObject : function () {
            var o = {};
            var a = this.serializeArray();
            $.each(a, function () {
                var t = this;
                if (o[this.name]) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[t.name]];
                    }
                    o[this.name].push(t.value || '');
                } else {
                    o[this.name] = t.value || '';
                }
            });
            return o;
        },
        tabToObject :function(){
            var o = {};
            $.each(this, function() {
                if(!$(this).attr('data-name')){return;}
                o[$(this).attr('data-name')] = $(this).attr('data-value') || '';
            });
            return o;
        },
        setform :function (jsonValue) {
            var obj=this,o=null;
            $.each(jsonValue, function (id, ival) {
                    o=obj.find('[name="'+id+'"]');
                    if(o.attr('type')=='radio'){
                        obj.find('[name="'+id+'"][value="'+ival+'"]').iCheck('check');
                    }else if(o.attr('type')=='checkbox'){
                        if(typeof ival =='object'){
                            $.each(ival,function(){
                                obj.find('[name="'+id+'"][value="'+this+'"]').iCheck('check');
                            });
                        }else{
                            obj.find('[name="'+id+'"][value="'+ival+'"]').iCheck('check');
                        }

                    }else if(o.hasClass('select')){
                        obj.find('[name="'+id+'"]').selectpicker('val', ival);
                    }else{
                        obj.find('[name="'+id+'"]').val(ival);
                    }
                }
            )
        },
        createTree: function() {
            var $this = this;
            if (this[0]._fancytree) return;
            this[0]._fancytree = true;
            var $window = $(window);
            var backshow = $this.data('backshowurl')? $this.data('backshowurl') : false,
                url = backshow || $this.data('url'),
                type = parseInt($this.data('type')) || 1,
                orgin = $this.data('orgin');

            if(!url)return;
            var $div = $('<div>').addClass('fancy-tree'),
                $tree = $('<div>').addClass('tree-container'),
                $buttons = $('<div class="operate-buttons clearfix"><a href="#" class="btn btn-primary-outline save">选择</a><a href="#" class="btn btn-link cancel">取消</a><a href="#" class="btn btn-danger-outline pull-left empty">清空</a></div>');
            var $fancytree = null;
            $.req(url, {}, function(data){
                var data = JSON.parse(data);

                backshow && handleData(data);

                $this.wrapAll($div).after($tree);
                $fancytree = $tree.fancytree({
                    icon: true,
                    source: data,
                    checkbox: (type===1)?false:true,
                    selectMode: 3,
                    lazyLoad: function(e, data) {
                        var key = data.node.key;
                        var url = $this.data('url') + ($this.data('url').indexOf('?') >= 0 ? '&' : '?')  +'nodeid=' + key;
                        data.result = {url: url};
                    },
                    loadChildren: function(event, data) {
                        var node = data.node,
                            isSel = node.isSelected();
                        if (isSel) {
                            node.children.forEach(function(item) {
                                item.setSelected(true);
                            })
                        }
                        // data.node.fixSelection3AfterClick();
                    }
                });
                $tree.append($buttons);

                $this.focus(function(){
                    $tree.show();
                    $(this).blur();
                    $window.on('resize.getSize scroll.getSize', getSize).resize();
                })
                $buttons.on('click', '.save', function(){
                    if (type===1) {
                        var node = $fancytree.fancytree('getTree').getActiveNode();
                        if(!node) return $.message('warning', '请选择一个节点！');
                            
                        var title = node.title,
                            key = node.key;
                        var val = $this.val();
                        $this.val(title).attr('data-id', key);
                        (title !== val) && $this.trigger('change'); 
                    } else{
                        var nodes = $fancytree.fancytree('getTree').getSelectedNodes();
                        var titles = [], keys = [];
                        var dataId;
                        for(var i in nodes) {
                            titles.push(nodes[i].title);
                            keys.push(nodes[i].key);
                        }
                        if (orgin) {
                            var obj = {
                                keys: keys,
                                titles: titles
                            }
                            dataId = JSON.stringify(obj)
                        } else {
                            dataId = keys.join(',');
                        }
                        $this.val(titles.join(',')).attr({
                            'data-id': dataId,
                            'title': titles.join(',')
                        });
                    }
                    $tree.hide();
                    $this.focusin();
                    $window.off('resize.getSize scroll.getSize', getSize);
                }).on('click', '.cancel', function(){
                    $tree.hide();
                    $this.focusout();
                    $window.off('resize.getSize scroll.getSize', getSize);
                }).on('click', '.empty', function(){
                    $fancytree.fancytree('getTree').getSelectedNodes().forEach(function(node) {
                        node.setSelected(false);
                    });
                    $this.val('').attr('data-id', '');
                    $tree.hide();
                    $this.focusout();
                    $window.off('resize.getSize scroll.getSize', getSize);
                })

                function handleData(data) {
                    data.forEach(function(item) {
                        if (item.folder === "true") {
                            if (item.children.length) {
                                item.expanded = true;
                                handleData(item.children);
                            }else {
                                delete item.children;
                                item.lazy = true;
                            }
                        } else {
                            delete item.children;
                        }
                    })
                }

            })

            var getSize = function(){
                var $uiTree = $tree.find('.ui-fancytree');
                if (!$uiTree.length) return;
                var top = $uiTree.offset().top,
                    scrollTop = $window.scrollTop(),
                    winH = $window.height(),
                    btnH = 60,
                    left =  $uiTree.offset().left,
                    winW = $window.width();
                $uiTree.css({
                  'max-height': winH + scrollTop - top - btnH +'px',
                  'max-width': winW - left -15 +'px'
                });
            }
        },
        createFormTree: function(){
            var $this = this;
            var url = $this.data('url'),
                type = parseInt($this.data('type')) || 1,
                name = $(this).data('name'),
                required = $(this).data('required') || false,
                expanded = $(this).data('expanded') || false,
                readonly = $(this).data('readonly') || false;

            if(!url || !name) return;
            $.req(url, {}, function(data){
                var data = JSON.parse(data);
                var $input = $('<input type="text" class="hidden">').attr('name', name);
                if (required === true) {
                    $input.addClass('required');
                }
                if (expanded === true) {
                    data = addExpand(data);
                }

                var $tree = null;
                switch(type){
                    case 1:
                        var opts = {
                            icon: true,
                            source: data,
                            activate: function(){
                                getNode();
                            }
                        }

                        if(readonly) {
                            opts.click=function(e, data) {
                                if(data.targetType === 'title') {
                                    return false;
                                }
                            }
                        }

                        $tree = $this.fancytree(opts);
                        getNode();
                        break;
                    case 2:
                        var opts = {
                            icon: true,
                            source: data,
                            checkbox: true,
                            selectMode: 3,
                            select: function(e){
                                getNodes();
                            }
                        }

                        if(readonly) {
                            opts.click=function(e, data) {
                                if(data.targetType === 'checkbox') {
                                    return false;
                                }
                            }
                        }

                        $tree = $this.fancytree(opts);
                        getNodes();
                        break;
                }
                _addNodesStyle();

                $this.append($input);
                
                function getNode() {
                    var node = $tree.fancytree('getTree').getActiveNode(),
                        key = node?node.key:''; 
                    $($input).val(key);
                }
                function getNodes() {
                    var keys = [];

                    $tree.fancytree('getTree').visit(function(data){
                        if(data.partsel){
                            var pid = data.parent.title === 'root' ? 'root' : data.parent.key;
                            keys.push({
                                key: data.key,
                                pid: pid
                            }) 
                        }
                    });

                    $($input).val(keys.length===0 ? '' : JSON.stringify(keys));
                }
                function _addNodesStyle() {
                    $tree.fancytree('getTree').visit(function(node){
                        var security = node.data.security || '';
                        switch(security){
                            case '0':
                                node.addClass('default');
                                break;
                            case '1':
                                node.addClass('warning');
                                break;
                            case '2':
                                node.addClass('danger');
                                break
                            default:
                        }
                    });
                }
                function addExpand(data) {
                    for (var i in data) {
                        if (data[i].folder) {
                            data[i].expanded = true;
                            if (data[i].key !== 'archivesManage'){
                                data[i].children = addExpand(data[i].children);
                            }
                        }
                    }
                    return data;
                }
            }, false)
            
        }
    });
    $.extend({
        message:function (type, text, time) {
            var t="",i="";
            switch(type){
                case 'default' :t="notification"; i = 'info-circle'; break;
                case 'warning' :t="warning"; i = 'exclamation-triangle'; break;
                case 'danger'  :t="error"; i = 'times-circle'; break;
                case 'success' :t="success"; i = 'check-circle'; break;
                case 'info'    :t="information"; i = 'info-circle'; break;
            }
            return noty({
                text        : '<i class="fa fa-'+i+'"></i> '+text,
                type        : t,
                dismissQueue: true,
                killer: true,
                timeout: time || 3000,
                layout      : 'center',
                theme       : 'bootstrapTheme'
            });
        },
        confirm: function (text, callback) {
            return noty({
                text        : '<i class="fa fa-question-circle"></i> '+text,
                type        : 'warning',
                dismissQueue: true,
                layout      : 'center',
                theme       : 'bootstrapTheme',
                buttons     : [
                    {addClass: 'btn btn-default btn-dashed', text: '取消', onClick: function ($noty) {
                        $noty.close();

                    }
                    },
                    {addClass: 'btn btn-primary', text: '确定', onClick: function ($noty) {
                        $noty.close();
                        callback();
                    }
                    }
                ]
            });
        },
        req: function (url, param, callback, ifasync, errcallback) {
            var ifasync = (ifasync===false)?false:true;
            $.ajax({
                type: 'POST',
                url: url,
                data: param,
                async: ifasync,
                success: function (data) {
                    var data = Object.prototype.toString.call(data) === '[object String]' ? data : JSON.stringify(data);
                    if(preHandleResult(data) == false && $.isFunction(callback)){
                        callback(data);
                    }
                },
                error: function (e, t, error) {
                    $.message('danger','系统错误!');
                    errcallback(e, t, error);
                }
            });
        },
        browser: function (userAgent, language) {
            var version, webkitVersion, browser = {};
            userAgent = (userAgent || navigator.userAgent).toLowerCase();
            language = language || navigator.language || navigator.browserLanguage;
            version = browser.version = (userAgent.match(/.*(?:rv|chrome|webkit|opera|ie)[\/: ](.+?)([ \);]|$)/) || [])[1];
            webkitVersion = (userAgent.match(/webkit\/(.+?) /) || [])[1];
            browser.windows = browser.isWindows = !!/windows/.test(userAgent);
            browser.mac = browser.isMac = !!/macintosh/.test(userAgent) || (/mac os x/.test(userAgent) && !/like mac os x/.test(userAgent));
            browser.lion = browser.isLion = !!(/mac os x 10_7/.test(userAgent) && !/like mac os x 10_7/.test(userAgent));
            browser.iPhone = browser.isiPhone = !!/iphone/.test(userAgent);
            browser.iPod = browser.isiPod = !!/ipod/.test(userAgent);
            browser.iPad = browser.isiPad = !!/ipad/.test(userAgent);
            browser.iOS = browser.isiOS = browser.iPhone || browser.iPod || browser.iPad;
            browser.android = browser.isAndroid = !!/android/.test(userAgent);
            browser.opera = /opera/.test(userAgent) ? version : 0;
            browser.isOpera = !!browser.opera;
            browser.msie = /msie/.test(userAgent) && !browser.opera ? version : 0;
            browser.isIE = !!browser.msie;
            browser.isIE8OrLower = !!(browser.msie && parseInt(browser.msie, 10) <= 8);
            browser.mozilla = /mozilla/.test(userAgent) && !/(compatible|webkit|msie)/.test(userAgent) ? version : 0;
            browser.isMozilla = !!browser.mozilla;
            browser.webkit = /webkit/.test(userAgent) ? webkitVersion : 0;
            browser.isWebkit = !!browser.webkit;
            browser.chrome = /chrome/.test(userAgent) ? version : 0;
            browser.isChrome = !!browser.chrome;
            browser.mobileSafari = /apple.*mobile/.test(userAgent) && browser.iOS ? webkitVersion : 0;
            browser.isMobileSafari = !!browser.mobileSafari;
            browser.iPadSafari = browser.iPad && browser.isMobileSafari ? webkitVersion : 0;
            browser.isiPadSafari = !!browser.iPadSafari;
            browser.iPhoneSafari = browser.iPhone && browser.isMobileSafari ? webkitVersion : 0;
            browser.isiPhoneSafari = !!browser.iphoneSafari;
            browser.iPodSafari = browser.iPod && browser.isMobileSafari ? webkitVersion : 0;
            browser.isiPodSafari = !!browser.iPodSafari;
            browser.isiOSHomeScreen = browser.isMobileSafari && !/apple.*mobile.*safari/.test(userAgent);
            browser.safari = browser.webkit && !browser.chrome && !browser.iOS && !browser.android ? webkitVersion : 0;
            browser.isSafari = !!browser.safari;
            browser.language = language.split("-", 1)[0];
            browser.current = browser.msie ? "msie" : browser.mozilla ? "mozilla" : browser.chrome ? "chrome" : browser.safari ? "safari" : browser.opera ? "opera" : browser.mobileSafari ? "mobile-safari" : browser.android ? "android" : "unknown";
            return browser;
        },
        getURLParams: function() {
            var urlParams = {};
            var queryStr = window.location.href;
            var e,
                d = function(s) {
                    return decodeURIComponent(s.replace(/\+/g, " "));
                },
                q = queryStr.substring(queryStr.indexOf('?') + 1),
                r = /([^&=]+)=?([^&]*)/g;
            while (e = r.exec(q)){
                urlParams[d(e[1])] = d(e[2]);
            }
            return urlParams;
        },
        getRealLength: function(value){
            var pattern =/[^\u0000-\u00ff]/g;    //匹配双字节字符(包括汉字在内)
            return value.replace(pattern,'__').length;
        },
        checkFileSize: function(file, size) {
            var _this = file ;
            var browser = $.browser(), _size = 0,  flag = true;
            if (browser.isIE) {
                var fileSystem = new ActiveXObject('Scripting.FileSystemObject');
                _size  = fileSystem.GetFile(_this.value).size;
            } else {
               _size =  _this.files[0].size;
            }
            if($(_this).hasClass("filetwo")){
            	if (_size > 1024*1024*50) {flag = false}
            }else{
            	if (_size > size) {flag = false}
            }
            return flag;
        }
    });
    function preHandleResult(result) {
        //针对MIISPROJ中,会话超时的情况进行特殊处理
        var startIndex = result.indexOf("<SCRIPT LANGUAGE=\"JavaScript\">");
        var endIndex = result.indexOf("</SCRIPT>");
        if( startIndex != -1 && endIndex != -1) {
            var script = result.substring(startIndex + "<SCRIPT LANGUAGE=\"JavaScript\">".length , endIndex);
            $.message('warning', '用户会话超时请重新登录!');
            eval(script);
            return true;
        }
        
        return false;
    }
})(jQuery);
var GLOBAL = {
    loading: {
        _size: 0,
        start: function(){
            if($("#loading").size()>0){
                $("#loading").show();
                this._size++;
            }else{
                this._size=0;
                $("<div id='loading' style='position:fixed;z-index:10000000;left:0;right:0;top:0;bottom:0;background:url('"+ seajs.baseHTTP +"'/images/loading.gif) no-repeat center;'></div>").appendTo("body");
            }
        },
        end: function(){
            this._size--;
            if(this._size<=0){
                $("#loading").hide();
            }
        }
    },
    menuarrow: function(){
        if($('.menu-arrow').size()>0){
            // var $n_header = $('.navbar-header'); 
            $('.menu-arrow').click(function(){
                $(this).focusout();
                var $parent = $(this).parents('.layout-left');
                $parent.toggleClass('contract');
                if($parent.hasClass('contract')){
                    $(this)
                        .addClass('fa-arrow-right').removeClass('fa-arrow-left')
                        .attr('data-original-title','最大化');
                    $parent.find('.avatar').removeClass('avatar-md').addClass('avatar-xs');
                    $parent.find('.menu-sub>h4').each(function(){
                        var title = $(this).find('.title').text();
                        $(this).attr('data-original-title',title).find('.title').text('');
                    })
                    $('#stage').css('padding-left','40px');
                    // $n_header.css('width', '32px');
                }else{
                    $(this)
                        .addClass('fa-arrow-left').removeClass('fa-arrow-right')
                        .attr('data-original-title','最小化');
                    $parent.find('.avatar').removeClass('avatar-xs').addClass('avatar-md');
                    $parent.find('.menu-sub>h4').each(function(){
                        var title = $(this).data('original-title');
                        $(this).attr('data-original-title','').find('.title').text(title);
                    })
                    $('#stage').css('padding-left','245px');
                    // $n_header.css('width', '236px');
                }
            })
        }
    },
    plugins: {
        init: function($scope) {
            var $scope = $scope || $('body');
            this.tooltip($scope);
        },
        initPlgs: function(arr, $scope) {
            if (!$.isArray(arr)) {
                return $.message('danger', arr + ' is not array!')
            }
            $.each(arr, function(i, item) {
                GLOBAL.plugins[item] && GLOBAL.plugins[item]($scope);
            })
        },
        destroyPlgs: function(arr, $scope) {
            if (!$.isArray(arr)) {
                return $.message('danger', arr + ' is not array!')
            }
            $.each(arr, function(i, item) {
                switch(item) {
                    case 'tooltip':
                        $('.item', $scope).each(function(){
                            $(this).tooltip('destroy');
                        })
                        break;
                    case 'select':
                        $('.select', $scope).each(function(){
                            $(this).selectpicker('destroy');
                        })
                        break;
                    case 'datepick':
                        $('.datepick', $scope).each(function(){
                            $(this).datepicker('destroy');
                        })
                        break;
                    case 'checkbox':
                        $('.icheckbox', $scope).each(function(){
                            $(this).iCheck('destroy');
                        })
                        break;
                    case 'tree':
                        $('.tree-container', $scope).each(function(){
                            $(this).fancytree('getTree').treeDestroy();
                        })
                        break;
                    case 'formTree':
                        $('.formTree', $scope).each(function(){
                            $(this).fancytree('getTree').treeDestroy();
                        })
                        break;
                    case 'selectAuto':
                        break;
                }
            })
        },
        tooltip: function($scope) {
            var $tooltip = $scope.find('[data-toggle="tooltip"]');
            $tooltip.size()>0 && $tooltip.tooltip();
        },
        select: function($scope) {
            var $select = $scope.find('.select');
            $select.size()>0 && $select.selectpicker();
            if (!seajs.production) {
                $select.each(function() {
                    var $this = $(this);
                    $this.parent().attr('data-name', $this.attr('name') || '');
                })
            }
        },
        datepick: function($scope) {
            var $datepick = $scope.find('.datepicker');
            if ($datepick.size() > 0) {
                $datepick.each(function() {
                    if($(this).attr('readonly'))return;
                    var opts = {
                        format: 'yyyy-mm-dd',
                        language: 'zh-CN',
                        todayHighlight: true,
                        msgBtn: $(this).data('msg') || ''
                    }
                    $(this).datepicker(opts);
                })
            }
        },
        checkbox: function($scope) {
            var $icheck = $scope.find('.icheckbox');
            if ($icheck.size() > 0) {
                $icheck.each(function() {
                    $(this).iCheck({checkboxClass:($(this).attr("color"))?"icheckbox_flat-"+$.trim($(this).attr("color")):"icheckbox_flat",radioClass:($(this).attr("color"))? "iradio_flat-"+$.trim($(this).attr("color")):"iradio_flat"});
                })
            }
        },
        fileinput: function($scope) {
            var $fileinput = $scope.find('.fileinput');
            if ($fileinput.size() > 0) {
                $fileinput.each(function() {
                    $(this).bootstrapFileInput();
                    if($(this).data('prefile')){
                        $(this).parent().after('<span class="file-input-name">'+$(this).data('prefile')+'</span>');
                    }
                })
            }
        },
        tree: function($scope){
            var $tree = $scope.find('.tree');
            if($tree.size()>0){
                $tree.each(function() {
                    $(this).createTree();
                })
            }
        },
        formTree: function($scope) {
            var $formTree = $scope.find('.formTree');
            if($formTree.size()>0){
                $formTree.each(function() {
                    $(this).createFormTree();
                })
            }
        },
        autoComplete: function($scope) {
            var $autoComplete = $scope.find('.autoComplete');
            if ($autoComplete.size() > 0) {
                $autoComplete.each(function() {
                    $(this).autoComplete();
                })
            }
        },
        selectAuto: function($scope) {
            var $selectAuto = $scope.find('.selectAuto');
            if ($selectAuto.size() > 0) {
                $selectAuto.each(function() {
                    $(this).selectAuto();
                })
            }
        }

    },
    compatIE8OrLower: function(){
        var isIe8 = $.browser().isIE8OrLower;
        if (isIe8) {
            var menu_arrow = '<span class="menu-arrow"></span>';
            $('#navbar .dropdown').prepend(menu_arrow);
        }
    },
    layouts: function() {
        if ($(".layout").size()>0) {
            var _t = $('.layout-left').offset().top;
            var $window = $(window);

            $window.resize(_.debounce(function() {
                var _h = $window.innerHeight();
                $(".layout-left").css('min-height', _h-_t + 'px');
                $(".layout-right, .layout-right>.tab-content").css('min-height', _h-_t + 'px');

            }, 50))

            $(window).resize();
        }
    },
    init: function(){
        this.compatIE8OrLower();
        this.menuarrow();
        this.layouts();
        this.plugins.init();
    }
};
GLOBAL.init();

/**
 * created by xsm5202 2011-11-30
 * 
 * Depends:
 * jquery.ui.core.js
 * jquery.ui.widget.js
 * important!!!   注意标注
 */
(function($) {

var pattern = /#\{[\w.]+\}/g; 
var btn_type = {
    'query'     : {'font': 'fa fa-search',         'color': 'btn btn-primary'},
    'add'       : {'font': 'fa fa-plus',           'color': 'btn btn-primary'},
    'edit'      : {'font': 'fa fa-edit',           'color': 'btn btn-warning'},
    'delete'    : {'font': 'fa fa-remove',         'color': 'btn btn-danger'},
    'reset'     : {'font': 'fa fa-refresh',           'color': 'btn btn-primary'},
    'save'      : {'font': 'fa fa-save',           'color': 'btn btn-primary'},
    'submit'    : {'font': 'fa fa-share',          'color': 'btn btn-primary'},
    'view'      : {'font': 'fa fa-eye',            'color': 'btn btn-info'},
    'review'    : {'font': 'fa fa-check-square-o', 'color': 'btn btn-primary'},
    'audit'     : {'font': 'fa fa-share-square-o', 'color': 'btn btn-primary'},
    'download'  : {'font': 'fa fa-download',       'color': 'btn btn-success'},
    'upload'    : {'font': 'fa fa-upload',         'color': 'btn btn-primary'},
    'allsubmit' : {'font': 'fa fa-share',          'color': 'btn btn-primary'},
    'allreview' : {'font': 'fa fa-check-square-o', 'color': 'btn btn-primary'},
    'cancel'    : {'font': 'fa fa-remove',         'color': 'btn btn-primary'}
};

var layoverId = 0;
function getNextLayOverId() {
    return ++layoverId;
}
$.widget( "ui.layover",{
    options : {
        id : "layover-",
        text: ''
    },
    _create : function (){
        var o = this.options,
            layover = $(".ui-layover",this.element);
        
        if(layover.length == 0){
            layover = $("<div id='"+o.id+getNextLayOverId()+"' class='ui-layover'><div class='layover-background'></div><div class='load'><div class='content'><img width=45 height=45 src='"+ seajs.baseHTTP +"/images/loading.gif'><p class='text'>"+o.text+"</p> </div></div></div>");
            this.element.append(layover);
        }
        
    },
    _init : function () {
        var layover = $(".ui-layover",this.element).last();
        this.element.css('position', 'relative');
        if (layover.length > 0){
            layover.css("display", "block")
                .width(this.element.scrollWidth)
                .height(this.element.scrollHeight);
        }
    },
    disable : function () {
        var layover = $(".ui-layover",this.element).last();
        if (layover.length > 0){
            layover.css("display","none");
        }
    },
    enable : function () {
        var layover = $(".ui-layover",this.element).last();
        if (layover.length > 0){
            layover.css("display","block");
        }
    },
    destroy : function (){
        var layover = $(".ui-layover",this.element).last();
        
        if(layover.length > 0){
            layover.remove();
        }
    }
});

var modalId = 0;
function getModalId() {
    return ++modalId;
}
$.widget( "ui.upload",{
    options : {
        url : null,
        modal: null,
        inputH: null,
        processResult: null,
        defaultSize: 1024*1024*10,
        limitSizeText: '文件大小超过限制，请控制在10M以内！'
    },
    _create : function (){
        var $file = this.element;
        var o = this.options;
        var url = o.url, $modal = o.modal;
        if(!url || !$modal) return;

        var form = $('form', $modal),
            m_file = $('[type="file"]', $modal),
            m_text = $('[type="text"]', $modal);
        var $inputH = o.inputH;
        var _modalId = 'modal-'+getModalId();
        $file.on('click', function() {
            if($file.siblings('.uploadLoading').size() > 0) {
                return $.message('danger', '请等待文件上传完成');
            }
            $('form', $modal)[0].reset();

            if ($inputH && $inputH.size() > 0) {
                var name = $inputH.data('name'),
                    val = $inputH.val();
                m_text.attr('name', name).val(val);
            }
            m_file.attr('name', $(this).data('name'));
            $modal.modal('show');
            $('.submit', $modal).attr('data-submit', _modalId);
            
        })

        m_file.off('change').on('change', function(){
            if (!$.checkFileSize(this, o.defaultSize)){
                if($(this).hasClass("filetwo")){
                	$.message('danger', "文件大小超过限制，请控制在50M以内！");
                }else{
                	$.message('danger', o.limitSizeText);
                }
            }
        })

        $('.submit', $modal).attr('data-submit', _modalId);
        $modal.on('click', '[data-submit='+_modalId+']' , function() {
        	if(!m_file.val()){return $.message('danger','请先上传文件！')}
            if (!$.checkFileSize(m_file[0], o.defaultSize)) { return 
            	if($(m_file[0]).hasClass("filetwo")){
                	$.message('danger', "文件大小超过限制，请控制在50M以内！");
                }else{
                	$.message('danger', o.limitSizeText);
                }
            	//$.message('danger', o.limitSizeText);
            
            }

            $modal.modal('hide');
            $file.parent().find('.downloadFile').addClass('hidden');
            $file.parent().find('.uploadLoading').size() <= 0 ? $file.after('<p class="uploadLoading">文件上传中...</p>'):'';

            var id = 'jqFormIO' + (new Date().getTime()),
                iframeSrc = /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
                $io,io;
        
            $io = $('<iframe name="' + id + '" src="'+ iframeSrc +'" />');
            $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
            
            io = $io[0];
            
            form.attr("action",url);
            form.attr("method","POST");
            
            form.after($io);
            form.attr("target",id);
            io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
            
            function cb(e) {
                io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);
                
                var doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
                    result = doc ? doc.body.innerHTML : '';
                
                if(preHandleResult(result) == false && $.isFunction(o.processResult)){
                     o.processResult.call(this, result);
                }
                
                if($.isFunction(o.afterProcessResult)) {
                    o.afterProcessResult.call(this);
                }
            }
            form.submit();
        })


    }
});

$.widget("ui.drag", {
    options: {
        actions:[],
        spaceChar: "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;",
        dateChar: "________年________月________日",
        checkChar: "□"
    },
    _create: function() {
        var opts = this.options;
        var actions = opts.actions;
        
        var $buttonGroup;
        if ($(".contract-handle-btns", this.element).length == 0){
            var target = $('.header .DocDefaults', this.element);
            $buttonGroup = $("<div>").addClass("contract-handle-btns");
            $buttonGroup.appendTo(target);
        }else {
            $buttonGroup = $(".contract-handle-btns", this.element);
        }
        
        $buttonGroup.append('<a class="btn btn-warning btn-sm" data-toggle="sidepage" data-target="sidepage"><i class="fa fa-edit"></i>修改</a>');

        $.each(actions, function(i, action) {
            var $icon = $("<i>").addClass(btn_type[action.name].font ? btn_type[action.name].font : "fa fa-search" );
            var anchor = $("<a>").addClass(btn_type[action.name].color ? btn_type[action.name].color : "btn btn-priamry").addClass("btn-sm").append($icon).append(action.label).appendTo($buttonGroup); 

            anchor.on('click.drag', function(){
                action.processResult.call(this);
            })
        })

        $(".drop-text", this.element).each(function(){
            if($(this).hasClass('dropselect'))return;
            $(this).html(opts.spaceChar);
        });
    },
    _init: function() {
        this._backshow();
        this._sidepage();
        this._drop();
        this._drag();
        this._resize();
    },
    _backshow: function () {
        var _arr = ['drop-text', 'drop-date', 'drop-table', 'drop-checkbox'];
        var createTbody = this._createTbody;
        var opts = this.options;
        $('.document .drop-date', this.element).each(function(){
            if(!$(this).hasClass('hasFactor')){
                $(this).text(opts.dateChar)
            }
        })
        $('.document .drop-table', this.element).each(function(){
            $(this).find('td').text('')
        })
        $.each(_arr, function(i, item) {
            var $this = $('.document .hasFactor.'+item, this.element);
            $this.each(function() {
                var data = JSON.parse($(this).attr('data-factor'));
                var $span = $('<span class="dropselect">')
                .append('<span name="'+data.name+'">'+data.label+'</span>');
                switch (i) {
                    case 0:
                        $span.addClass('drop-text');
                        $(this).empty().append($span);
                        break;
                    case 1:
                        $span.addClass('drop-date');
                        $(this).empty().append($span);
                        break;
                    case 3:
                        var text = $(this).text();
                        $span.addClass('drop-checkbox');
                        $(this).empty().append($span).attr('data-checkbox', text);
                        break;
                    case 2:
                        var html = $(this).html();
                        var $span = $('<span class="dropselect drop-table">')
                            .append('<span name="'+data.name+'">表格'+data.label+'</span>');
                        $(this).attr({'table-html': html}).empty()
                            .append('<td class="dragcontainer"></td>')
                            .find('.dragcontainer').append($span);
                        break;
                }
            })
        })
    },
    _sidepage: function() {
        var _that  = this;
        this.element.on('click', '[data-toggle="sidepage"]', function() {
            var target=$(this).attr("data-target");
            $("."+target, _that.element).addClass("open")
            _that.element.css('padding-right', '360px');
        }).on('click','.sidepage .close',function(){
            $(this).parents(".sidepage").removeClass("open")
            _that.element.css('padding-right', '10px');
            return false;
        }).on('click', '[data-type="reset"]', function(){
            _that.reset();
        })
    },
    _drop: function() {
        var opts = this.options;
        var createTbody = this._createTbody;
        $('.drop-text', this.element).droppable({
            activeClass: 'ui-state-text',
            drop: function(e, ui) {
                var $parent = $(ui.draggable).parent();
                var text = $.trim($(this).text());
                if (!$parent.hasClass('divider-text') && !$parent.hasClass('original-text'))return;
                if ($(this).find('.drop-text').length) return;

                if(text) {
                    var droptext = $(this).html();
                    var dragtext = $(ui.draggable).html();

                    $(this).empty().append(dragtext);
                    $(ui.draggable).empty().append(droptext);
                } else {
                    $(this).empty().append(ui.draggable.context);
                    $parent.hasClass('divider') && $parent.addClass('hidden');
                    $parent.hasClass('drop-text') && $parent.html(opts.spaceChar);
                }

            }
        });
        $('.drop-date', this.element).droppable({
            activeClass: 'ui-state-date',
            drop: function(e, ui) {
                var $parent = $(ui.draggable).parent();
                var text = $.trim($(this).text());
                if (!$parent.hasClass('divider-date') && !$parent.hasClass('original-date'))return;
                if ($(this).find('.drop-date').length) return;

                if(text.indexOf(opts.dateChar) > -1) {
                    $(this).empty().append(ui.draggable.context);
                    $parent.hasClass('divider') && $parent.addClass('hidden');
                    $parent.hasClass('drop-date') && $parent.html(opts.dateChar);
                } else {
                    var droptext = $(this).html();
                    var dragtext = $(ui.draggable).html();

                    $(this).empty().append(dragtext);
                    $(ui.draggable).empty().append(droptext);
                }
            }
        });
        $('.drop-checkbox', this.element).droppable({
            activeClass: 'ui-state-checkbox',
            drop: function(e, ui) {
                var $parent = $(ui.draggable).parent();
                var text = $.trim($(this).text());
                if (!$parent.hasClass('divider-checkbox') && !$parent.hasClass('original-checkbox'))return;
                if ($(this).find('.drop-checkbox').length) return;

                if(/[□☑█]/g.test(text)) {
                    $(this).empty().append(ui.draggable.context).attr('data-checkbox', text);
                    $parent.hasClass('divider') && $parent.addClass('hidden');
                    $parent.hasClass('drop-checkbox') && $parent.html($parent.attr('data-checkbox'));
                } else {
                    var droptext = $(this).html();
                    var dragtext = $(ui.draggable).html();

                    $(this).empty().append(dragtext);
                    $(ui.draggable).empty().append(droptext);
                }

            }
        });
        $('.drop-table', this.element).droppable({
            activeClass: 'ui-state-table',
            drop: function(e, ui) {
                var $parent = $(ui.draggable).parent();
                if (!$parent.hasClass('divider-table') && !$parent.parent().hasClass('original-table'))return;
                if ($(this).find('.drop-table').length) return;

                if($(this).hasClass('original-table')) {
                    var html = $(this).html();
                    $(this).attr({'table-html': html});
                    $(this).empty().append('<td class="dragcontainer"></td>').find('.dragcontainer').append(ui.draggable.context);
                    $parent.hasClass('divider') && $parent.addClass('hidden');
                    $parent.parent().hasClass('drop-table') && $parent.parent().html($parent.parent().attr('table-html'));
                 
                } else {
                    var droptext = $(this).html();
                    var dragtext = $(ui.draggable).html();

                    $(this).empty().append(dragtext);
                    $(ui.draggable).empty().append(droptext);
                    
                }

            }
        });
        $('.sidepage-footer', this.element).droppable({
            activeClass: 'ui-state-sidepage',
            drop: function(e, ui) {
                var $parent = $(ui.draggable).parent();
                if ($parent.hasClass('divider')) return;

                var $dropselects = $(this).siblings('.sidepage-body').children();
                var $div;
                if ($parent.hasClass('drop-text')) {
                    $div = $('<div>').addClass('col-md-12 divider divider-text').append(ui.draggable.context);
                    $parent.html(opts.spaceChar);
                } else if ($parent.hasClass('drop-date')) {
                    $div = $('<div>').addClass('col-md-12 divider divider-date').append(ui.draggable.context);
                    $parent.html(opts.dateChar);
                } else if ($parent.hasClass('drop-checkbox')) {
                    $div = $('<div>').addClass('col-md-12 divider divider-checkbox').append(ui.draggable.context);
                    $parent.html($parent.attr('data-checkbox'));
                } else if ($parent.parent().hasClass('drop-table')) {
                    var $parent = $parent.parent();
                    $div = $('<div>').addClass('col-md-12 divider divider-table').append(ui.draggable.context);
                    $parent.html($parent.attr('table-html'));
                }
                $dropselects.append($div);
            }
        });
    },
    _drag: function() {
        var _arr = ['drop-text', 'drop-date', 'drop-table', 'drop-checkbox'];
        $.each(_arr, function(i, item) {
            $('.dropselects .'+item, this.element).draggable({
                appendTo: 'body',
                helper: 'clone'
            });
            $('.document .hasFactor .'+item, this.element).draggable({
                appendTo: 'body',
                helper: 'clone'
            });
        })
    },
    _resize: function() {
        $(window).on('resize.sidepage', function(){
            var _h = $(this).height(),
                _dh = 90;

            $('.sidepage-body', this.element).length && $('.sidepage-body', this.element).height(_h-_dh+'px');
        }).resize();
    },
    reset: function() {
        var _that = this;
        var opts = this.options;
        var $item = $('.contract .dropselect', this.element);
        if ($item.size()>0) {
            $item.each(function(){
                var $parent = $(this).parent();
                
                $('.dropselects .hidden', _that.element).first().append(this).removeClass('hidden');
                $parent.html(opts.spaceChar);
            })
        }
    }
})

$.widget( "ui.form", {
    options : {
        actions: [],
        type : "POST",
        data : null,
        flag:null,
        layover : ".wrap_container",
        validate : false,
        mutilForm: false,
        mutilFormClass: null,
        targetself: false,
        formClass: null,
        buttonAuths : null
    },
    _create : function () {
        var options = this.options,
            form = options.formClass ? $(options.formClass, this.element) : $('form', this.element),
            layoverEle = $(form).closest(options.layover);
        
        if(layoverEle.length == 0) {
            layoverEle = $("body");
        }

        //initial url and type and 
        var  actions=this.options.actions;
        
        var $buttonGroup;
        if ($(".form-handle-btns", form).length == 0){
            var target = options.targetself ? $(this.element) : ($("fieldset",form).length > 0 ? $("fieldset",form).first() : form);
            $buttonGroup = $("<div>").addClass("row form-handle-btns");
            $buttonGroup.appendTo(target);
        }else {
            $buttonGroup = $(".form-handle-btns",form);
        }
        
        $.each(actions,function(index , action){
            if(options.buttonAuths && options.buttonAuths.indexOf(action.name+",") < 0){
                return ;
            }
            
            var $icon = $("<i>").addClass(btn_type[action.name].font ? btn_type[action.name].font : "fa fa-search" );
            var anchor = $("<button>").addClass(btn_type[action.name].color ? btn_type[action.name].color : "btn btn-priamry").append($icon).append(action.label).appendTo($buttonGroup);
            
            $(anchor).bind("click.form",function(e){
                //stop default submit action
                e.preventDefault();

                if(action.type === 'cancel') {
                    action.processResult.call(this);
                    return;
                }
                
                if(!action.novalidate && options.validate && !form.validate("validateForm")) {
                    return $.message('danger', '信息填写错误!');
                }

                if(!action.novalidate && options.mutilForm) {
                    var $forms = $(options.mutilFormClass, form);

                    if($forms.size()> 0){
                        var size = $forms.size(), count = 0;
                        $forms.each(function() {
                            $(this).validate("validateForm") && count++;
                        })
                        if(size > count) {
                            return $.message('danger', '信息填写错误!');
                        }
                    }
                    
                }

                //execute before submit function 
                if(action.beforeSubmit && $.isFunction(action.beforeSubmit) && action.beforeSubmit.call(this, e, action)== false){
                    return ;
                }

                if(action.modal && action.modal_tpl) {
                    var $modal = $('#mixture-modal');
                    var tpl = action.modal_tpl;

                    $('.modal-body', $modal).empty().append(tpl);
                    GLOBAL.plugins.initPlgs(['select', 'checkbox', 'tree'], $modal);

                    $('.extraBtn', $modal).length ? $('.extraBtn', $modal).remove() : '';
                    if (action.extraModalBtn) {
                        var extraModalBtn = action.extraModalBtn;
                        for (var i in extraModalBtn) {
                            var $btn = $('<a class="btn btn-primary-outline extraBtn">').text(extraModalBtn[i].name);
                            $('.modal-footer', $modal).append($btn);
                            $btn.off('click.modal').on('click.modal', function() {
                                if(!$('form', $modal).validate("validateForm")) return $.message('danger', '信息填写错误!');
                                var num = 0;
                                m_file.each(function() {
                                    if (this.value && !$.checkFileSize(this, defaultSize)){
                                    	if($(this).hasClass("filetwo")){
                                    		$.message('danger', "文件大小超过限制，请控制在50M以内！");
                                    	}else{
                                    		$.message('danger', limitSizeText);
                                    	}
                                        return false;
                                    }
                                    num++;
                                })
                                if (m_file.size() !== num) return;

                                extraModalBtn[i].processResult($modal);
                            })
                        }
                    }

                    var m_file = $('[type="file"]', $modal);
                    var defaultSize = 1024*1024*10, limitSizeText = '文件大小超过限制，请控制在10M以内！';
                    m_file.off('change').on('change', function(){
                        if (!$.checkFileSize(this, defaultSize)){
                            if($(this).hasClass("filetwo")){
                            	$.message('danger', "文件大小超过限制，请控制在50M以内！");
                            }else{
                            	$.message('danger', limitSizeText);
                            }
                        }
                    })


                    $modal.modal('show');
                    action.afterModalOpen && $.isFunction(action.afterModalOpen) && action.afterModalOpen.call(this, e, action);
                    $('form', $modal).validate();

                    $('[data-submit="modal"]', $modal).off('click.modal').on('click.modal', function(){
                        if(!$('form', $modal).validate("validateForm")) return $.message('danger', '信息填写错误!');
                        
                        var num = 0;
                        m_file.each(function() {
                            if (this.value && !$.checkFileSize(this, defaultSize)){
                                if($(this).hasClass("filetwo")){
                                	$.message('danger', "文件大小超过限制，请控制在50M以内！");
                                }else{
                                	$.message('danger', limitSizeText);
                                }
                                return false;
                            }
                            num++;
                        })
                        if (m_file.size() !== num) return;
                        
                        if(action.beforeModalSubmit && $.isFunction(action.beforeModalSubmit) && action.beforeModalSubmit.call(this, e, action)== false){
                            return ;
                        }

                        _callback($('form', $modal), $modal);
                    })
                    return;
                }
              

                _callback();

                function _callback($form, $modal){
                    var _modal = $form&&!action.formerForm ? $('.modal-content', $modal) : null;
                    if (_modal) {
                        _modal.layover();
                    } else {
                        layoverEle.layover();
                        $modal && $modal.modal('hide');
                    } 

                    var _form = $form&&!action.formerForm ? $form : form;
                    var modal_form = $form ? $form.children():'';
                    if(action.formerForm && modal_form) {
                        _form.append(modal_form.addClass('hidden formhidden'));
                    }

                    var q = _form.serializeTrim();
                    if(options.type.toUpperCase() == "GET"){
                        action.url += (action.url.indexOf('?') >= 0 ? '&' : '?') + q;
                        action.data = null;  // data is null for 'get'
                    }else {
                        action.data = q; // data is the query string for 'post' 
                        action.type = "POST";
                    }
                    
                    //set success callback function
                    action.success = function (result, textStatus, jqXHR){
                        if (_modal) {
                            _modal.layover("disable");
                            $modal.modal('hide');
                        } else {
                            layoverEle.layover("disable");
                        }
                        
                        if(preHandleResult(result) == false && $.isFunction(action.processResult)){
                            action.processResult.call(this, result, textStatus, jqXHR);
                        }
                        
                        if($.isFunction(action.afterProcessResult)) {
                            action.afterProcessResult.call(this);
                        }

                        if(action.formerForm) {
                            $('.formhidden', _form).remove();
                        }
                        
                    };
                    action.error = function(jqXHR, textStatus, errorThrown){
                        if (_modal) {
                            _modal.layover("disable");
                            $modal.modal('hide');
                        } else {
                            layoverEle.layover("disable");
                        }

                        if(action.formerForm) {
                        	$('.formhidden', _form).remove();
                        }
                        // 用于处理未明情况下的回调钩子函数
                        if($.isFunction(action.unkownHandler)) {
                            action.unkownHandler.call(this, jqXHR, textStatus, errorThrown);
                        }
                        
                        $.message('danger', '系统错误!');
                    };
                    
                    //ajax submit
                    var fileInputs = $('input:file', _form).length > 0;
                    var mp = 'multipart/form-data';
                    var multipart = (_form.attr('enctype') == mp || _form.attr('encoding') == mp);
                    
                    if(fileInputs && multipart) {
                        //form.unbind();
                        fileUpload();
                    }else {
                        $.ajax(action);
                    }
                    
                   

                    function fileUpload () {
                        var id = 'jqFormIO' + (new Date().getTime()),
                            iframeSrc = /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
                            $io,io;
                    
                        $io = $('<iframe name="' + id + '" src="'+ iframeSrc +'" />');
                        $io.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
                        
                        io = $io[0];
                        
                        _form.attr("action",action.url);
                        _form.attr("method","POST");
                        
                        _form.after($io);
                        _form.attr("target",id);
                        io.attachEvent ? io.attachEvent('onload', cb) : io.addEventListener('load', cb, false);
                        
                        function cb(e) {
                            io.detachEvent ? io.detachEvent('onload', cb) : io.removeEventListener('load', cb, false);
                            if (_modal) {
                                _modal.layover("disable");
                                $modal.modal('hide');
                            } else {
                                layoverEle.layover("disable");
                            }
                            
                            var doc = io.contentWindow ? io.contentWindow.document : io.contentDocument ? io.contentDocument : io.document;
                                result = doc ? doc.body.innerHTML : '';
                            
                            if(preHandleResult(result) == false && $.isFunction(action.processResult)){
                                action.processResult.call(this, result);
                            }
                            
                            if($.isFunction(action.afterProcessResult)) {
                                action.afterProcessResult.call(this);
                            }

                            if(action.formerForm) {
                            	$('.formhidden', _form).remove();
                            }
                        }
                        _form.submit();
                    }
                } // _callback end
                
                
            });
            
        });
        //init validate component
        if(options.validate) {
            form.validate();
        }
    },
    destroy : function () {
        var form = this.element;
        $(".form-handle-btns .btn",form).unbind("submit.form");
    }
}); 


$.widget( "ui.validate", {
    options : {
        rules : {},
        formulars:{},
        validators : {
            // http://docs.jquery.com/Plugins/Validation/Methods/required
            required : {
                message : "必填项!",
                validate : function(value, element, param) {
                    switch( element.nodeName.toLowerCase() ) {
                        case 'select':
                            // could be an array for select-multiple or a string, both are fine this way
                            var val = $(element).val();
                            return val && val.length > 0;
                        case 'input':
                            if ( /radio|checkbox/i.test(element.type) ) {
                                // :TODO untested 
                                var form =  this.element,
                                    length = $("input[name='"+element.name+"']",form).filter(':checked').length ;
                                return length > 0;
                            }
                        default :
                            return $.trim(value).length > 0;
                    }
                }
            },
            
            // http://docs.jquery.com/Plugins/Validation/Methods/email
            email: {
                message : "请输入有效的邮件地址!",
                validate : function(value, element) {
                    // contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
                    if(value == null || value.length == 0) 
                        return true;
                    return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/url
            url: {
                message : "请输入有效的URL!",
                validate : function(value, element) {
                    // contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
                    if(value == null || value.length == 0) 
                        return true;
                    return /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/date
            date: {
                message : "请输入有效的日期!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return !/Invalid|NaN/.test(new Date(value));
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/dateISO
            dateISO: {
                message : "请输入有效的日期,例如1987-11-19!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^\d{4}[-]\d{1,2}[-]\d{1,2}$/.test(value);
                }
            },
            
             phone: {
                message : "请输入手机号码或固定电话!(20位以内,输入数字、-、()、（）)",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[-\d()（）]{1,20}$/.test(value);
                }
            }, 
            
            fax_num: {
            message:"请输入有效的传真格式 3到4位数字-6到8位数字",
            validate : function(value, element) {
                if(value == null || value.length == 0) 
                    return true;
                return /^(\d{3,4}-)?\d{6,8}$/.test(value);
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/number
            number: {
                message : "请输入数值!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return  /^-?\d+(?:\.\d+)?$/.test(value);
                    //return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
                }
            },
            posinumber: {
                message : "请输入非负数值!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return  /^\d+(?:\.\d+)?$/.test(value);
                    //return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
                }
            },
            posinumberWeight: {
                message : "输入数值错误!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return  /^[0-9]{1,2}(?:\.\d{1,2})?$/.test(value);
                    //return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
                }
            },
            posinumberTask: {
                message : "输入数值错误!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return  /^[0-9]{1,14}(?:\.\d{1,2})?$/.test(value);
                    //return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(value);
                }
            },
            // http://docs.jquery.com/Plugins/Validation/Methods/digits
            digits: {
                message : "请输入正整数!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[1-9]\d*$/.test(value);
                }
            },
            
            nonnegative: {
                message : "请输入非负整数!",
                validate : function(value, element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^\d*$/.test(value);
                }
            },
            
            // http://docs.jquery.com/Plugins/Validation/Methods/minlength
            minlength : {
                message : "请输入不少于{0}个字符!",
                attrs : ["minlength"],
                validate : function(value, element, param) {
                    return value.length >= param[0];
                }
            },
            
            // http://docs.jquery.com/Plugins/Validation/Methods/maxlength
            maxlength : {
                message : "请输入不超过{0}个字符!",
                attrs : ["maxlength"],
                validate : function(value, element, param) {
                    return value.length <= param[0];
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/rangelength
            rangelength: {
                message : "请输入{0}到{1}个字符!",
                attrs : ["minlength","maxlength"],
                validate : function(value, element, param) {
                    return  value.length >= param[0] && value.length <= param[1] ;
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/min
            min: {
                message : "请输入大于等于{0}的值!",
                validate : function( value, element, param ) {
                    if(value == null || value.length == 0) 
                        return true;
                    try{
                        return parseFloat(value) >= parseFloat(param);
                    }catch(e){
                        return false;
                    }
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/max
            max: {
                message : "请输入小于等于{0}的值!",
                attrs : ["max"],
                validate : function( value, element, param ) {
                    if(value == null || value.length == 0) 
                        return true;
                    try{
                        return parseFloat(value) <= parseFloat(param);
                    }catch(e){
                        return false;
                    }
                }
            },

            // http://docs.jquery.com/Plugins/Validation/Methods/range
            range: {
                message : "请输入[{0},{1}]之间的值!",
                attrs : ["min","max"],
                validate : function( value, element, param ) {
                    if(value == null || value.length == 0) 
                        return true;
                    try{
                        return parseFloat(value) >= parseFloat(param[0]) && parseFloat(value) <= parseFloat(param[1])
                    } catch (e) {
                        return false;
                    }
                }
            },
            
            letternum : {
                message : "请输入字母,数字!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[A-Za-z0-9]+$/.test(value);
                }
            },
            
            jfnum : {
                message : "请输入小数点前最多3位，小数点后最多2位的数字",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^\d{1,3}(.\d{1,2})?$/.test(value);
                }
            },
            
            chletternum : {
                message : "请输入中文,字母,数字!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[A-Za-z0-9\u4E00-\u9FA5\uf900-\ufa2d]+$/.test(value);
                }
            },
            
            letternumline : {
                message : "请输入字母,数字,下划线!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^\w+$/.test(value);
                }
            },
            chletternumline : {
                message : "请输入中文,字母,数字,下划线!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[A-Za-z0-9_\u4E00-\u9FA5\uf900-\ufa2d]+$/.test(value);
                }
            },
            chletternumlinestrip: {
                message : "请输入中文,字母,数字或下划线或横杠或书名号!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return /^[A-Za-z0-9_\u4E00-\u9FA5\uf900-\ufa2d\-()（）《》]+$/.test(value);
                }
            },
            limitText: {
                message : "请输入中文,字母,数字,下划线，横杠，括号,逗号，句号，书名号，百分号，中文引号，冒号，顿号，斜杠，反斜杠，加号，空格，金额符号!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    //return /^[A-Za-z0-9_\u4E00-\u9FA5\uf900-\ufa2d\-()（），。,.《》%％￥$“”：:、＼／\\/\s+-]+$/.test(value);
                    return /^[A-Za-z0-9_\u4E00-\u9FA5\uf900-\ufa2d\u3002\uff1f\uff01\uff0c\u3001\uff1b\uff1a\u201c\u201d\u2018\u2019\uff08\uff09\u300a\u300b\u3008\u3010\u3011\u300e\u300f\u300c\u300d\ufe43\ufe44\u3014\u3015\u2026\u2014\uff5e\ufe4f\uffe5\-\(\)\[\]\{\},\.\?!%\$:;'"\\/\s]+$/.test(value);
                }
            }, 
            pastDateCheck: {
                message : "输入的日期不能大于今天!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    return value<=moment().format('L');
                }
            },                        
            pattern : {
                message : "{1}",
                attrs : ["pattern","msg"],
                validate : function (value , element, params) {
                    if(value == null || value.length == 0) 
                        return true;
                    var pattern = new RegExp(params[0]);
                    return pattern.test(value);
                }
                
            },
            math : {
                message : "{1}",
                attrs : ["math","mathmsg"],
                validate : function (value , element, params) {
                    if(value == null || value.length == 0) 
                        return true;
                    var form = this.element,
                        formular;
                    
                    formular = params[0].replace(pattern,function(mat){
                        var matchstr = mat.slice(2,-1);
                        var tmp = $("[name='"+matchstr+"']",form).val();
                        return (tmp != null) ? tmp : "";
                    });
                    
                    try{
                        var val = eval(formular);
                        if ( val == true) {
                            return true;
                        }else {
                            return false;
                        } 
                    }catch(e){
                        return true;
                    }
                }
            },
            equal : {
                message : "请输入与{1}一致！",
                attrs : ["equal"],
                validate : function (value , element, params) {
                    if(value == null || value.length == 0) 
                        return true;
                    var equalEle = $("[name='"+params[0]+"']",this.element),
                        equalVal = "";
                    if (equalEle.length > 0) {
                        this.validateEle(equalEle);
                        equalVal = equalEle.val();
                        if(equalVal==null||equalVal.length==0){
                            return true;
                        }
                    }
                    try{
                        if(value == equalVal){
                            return true;
                        }else {
                            var labelEle = equalEle.closest(".form-group").find(".control-label").first();
                            params[1] = labelEle.length > 0 ? labelEle.text() : "";
                            return false;
                        }
                    }catch(e){
                        return false;
                    }
                }
            },
            bigthan : {
                message : "请输入大于等于{1}的值！",
                attrs : ["bigthan"],
                validate : function (value , element, params) {
                    if(value == null || value.length == 0) 
                        return true;
                    var Ele = $("[name='"+params[0]+"']",this.element),
                        Val = "";
                    
                    if (Ele.length > 0) {
                        this.validateEle(Ele);
                        Val = Ele.val();
                        if(Val==null||Val.length==0){
                            return true;
                        }
                    }
                    
                    try{
                        if(parseFloat(value) >= parseFloat(Val)){
                            return true;
                        }else {
                            var labelEle = Ele.closest(".form-group").find(".control-label").first();
                            params[1] = labelEle.length > 0 ? labelEle.text() : "";
                            return false;
                        }
                    }catch(e){
                        return false;
                    }
                }
            },
            smallthan : {
                message : "请输入小于等于{1}的值！",
                attrs : ["smallthan"],
                validate : function (value , element, params) {
                    if(value == null || value.length == 0) 
                        return true;
                    var Ele = $("[name='"+params[0]+"']",this.element),
                        Val = "";
                    if (Ele.length > 0) {
                        this.validateEle(Ele);
                        Val = Ele.val();
                        if(Val==null||Val.length==0){
                            return true;
                        }
                    }
                    try{
                        if(parseFloat(value) <= parseFloat(Val)){
                            return true;
                        }else {
                            var labelEle = Ele.closest(".form-group").find(".control-label").first();
                            params[1] = labelEle.length > 0 ? labelEle.text() : "";
                            return false;
                        }
                    }catch(e){
                        return false;
                    }   
                }
            },
            ipvalidate : {
                message : "请输入正确的IP，多个以英文逗号分隔!",
                validate : function (value , element) {
                    if(value == null || value.length == 0) 
                        return true;
                    var regexp=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;    //首先必须是xxx.xxx.xxx.xxx类型的数字
                    for(var i=0;i<value.split(',').length;i++){                 //多个ip以英文逗号分隔
                        var ipVal=value.split(',')[i];
                        if(!regexp.test(ipVal)){
                            return false;
                        };
                        for(var j=0;j<ipVal.split('.').length;j++){                     //每一段的值都不能大于255，并且不能以0打头
                            var val=ipVal.split('.')[j];
                            if(val.length>1&&val.charAt(0)=='0'){
                                return false;
                            }else if(parseInt(val,10)>255){             
                                return false;
                            }
                        }
                    }
                    return true;
                }
            }
            
        }
    },
    _create : function () {
        var self = this,
            form =  this.element,
            o = this.options,
            rules = o.rules,
            validators = o.validators,
            formulars = o.formulars,
            ifIE = $.browser().isIE;
        
        // 增加class rules
        $("[type='text']:not('.search'), [type='number'], [type='password'], [type='file'], textarea , select , [type='radio'], [type='checkbox']", form).each(function() {
            
            var eleRules = {},
                element = $(this),
                classes = element.attr('class');
            
            classes && $.each(classes.split(' '), function() {
                if (this in validators) {
                    var validator = validators[this],
                        newRule  = {},
                        attrs = validator.attrs;
                    if(attrs) {  //获取rule所需的属性参数,
                        var params = [];
                        for (var i = 0 ; i < attrs.length ; i++ ) {
                            var attr = attrs[i];
                                param = element.attr(attr);
                            
                            param && params.push(param);
                        }
                        newRule[this] = params;
                    }else {
                        
                        newRule[this] = [];
                        
                    }
                    $.extend(eleRules, newRule);
                    
                }
            });
            
            rules[this.name] = eleRules;
            
            //新增计算规则
            if(element.attr('formular')){
                formulars[this.name] = element.attr('formular');
            }
            
        });
        
        //绑定文本框相应事件
        $("[type='text']:not('.search'), [type='number'], [type='password'], [type='file'], textarea, .ui-fancytree", form).on("focusin.validate focusout.validate",function(event){
            var target = event.target;
            var callback = self["_"+event.type];
            if($.isFunction(callback)){
                callback.call(self , target , event);
            }
        });
        
        $('.select', form).on('show.bs.dropdown', function(e){
            var target = $(this).find('select')[0];
            var callback = self["_focusin"];
            if($.isFunction(callback)){
                callback.call(self , target , 'focusin');
            }
        })
        $('.select', form).on('hide.bs.dropdown', function(e){
            var target = $(this).find('select')[0];
            var callback = self["_focusout"];
            if($.isFunction(callback)){
                callback.call(self , target , 'focusout');
            }
        })

        $(".iCheck-helper",form).on("click" , function(event) {
            var target = event.target;
            var callback = self["_"+event.type];
            if($.isFunction(callback)){
                callback.call(self , target , event);
            }
        });

        if (ifIE) {
            $('textarea.maxlength', form).on('input', function() {
                var manlen = $(this).attr('maxlength');
                if (!manlen)  return;
                if (this.value.length > parseInt(manlen)) {
                    this.value = this.value.substring(0, parseInt(manlen));
                }
            })
        }
        
    },
    _focusin : function (element, event) {
        var _type = element.tagName.toUpperCase();
        if ($(element).hasClass('ui-fancytree')){
           var name = $(element).closest('.formTree').data('name');
           element = $('[name="'+name+'"]')[0];
        }
        this._hideError(element);
        if ((_type === 'INPUT' || _type === 'TEXTAREA') &&　$(element).attr('maxlength')) {
                this._showInHelpBlock(element, '字符数不得超过'+$(element).attr('maxlength')+'个');
        }
    },
    _focusout : function (element, event) {
        var _type = element.tagName.toUpperCase();
        var _this = this;
        if ($(element).hasClass('ui-fancytree')){
           var name = $(element).closest('.formTree').data('name');
           element = $('[name="'+name+'"]')[0];
        }
        if(this.validateEle(element)){
            this.caculateEle();
        }
        if ((_type === 'INPUT' || _type === 'TEXTAREA') &&　$(element).attr('maxlength')) {
            if ($(element).closest('.modal').length) {
                setTimeout(function() {
                    _this._hideOutHelpBlock(element);
                }, 150)
            } else {
                _this._hideOutHelpBlock(element);
            }
        }
        
    },
    _showInHelpBlock: function(element, message) {
        var $parent = $(element).closest(".form-group");
        $parent.addClass("has-helpblock");
        
        var $span = $parent.find("span.helpblock");
        if($span.length > 0) {
            $span.removeClass("hide").addClass("show").html(message);
        }else {
            $("<span class='helpblock help-block show'>"+message+"</span>").appendTo($parent.children('div').first());
        }
    },
    _hideOutHelpBlock: function(element) {
        var $parent = $(element).closest(".form-group");
        $parent.removeClass("has-helpblock");
        
        var $span =$parent.find("span.helpblock");
        $span.removeClass("show").addClass("hide").html("");
    },
    _click : function (element , event ) {
        if($(element).hasClass('iCheck-helper')) {
            element = $(element).siblings('input')[0];
        }
        this.validateEle(element);
    },
    validateEle: function( element ) {
        var self = this ,
            o = this.options,
            eleRules = o.rules[element.name],
            validators = o.validators;

        if($(element).closest('.hidden').size()>0 && !$(element).hasClass('hidden')){
            return true;
        }

        if(eleRules && !eleRules['required'] && !element.value){
            return true;
        } 

        for (var method in eleRules ) {
            var rule = { method: method, parameters: eleRules[method] };
            
            //调用验证方法
            
            var validateMethod = validators[method].validate;
            var result = validateMethod.call( self, element.value.replace(/\r/g, ""), element, rule.parameters );
            //若验证不通过
            if( !result ) {
                
                //获取错误提示信息
                var message = validators[method].message ,
                    theregex = /\$?\{(\d+)\}/g;
                
                //若错误信息中包含变量用变量替换
                if (theregex.test(message)) {
                    $.each(rule.parameters, function(i, n) {
                        message = message.replace(new RegExp("\\{" + i + "\\}", "g"), n);
                    });
                }
                
                //显示错误信息
                self._showError(element,message);
                return false;
            }
        }
        self._hideError(element);
        return true;
    },
    caculateEle : function(){
        var form = this.element,
            o = this.options,
            formulars = o.formulars,
            key = null,
            formular;
        for (key in formulars){
            formular = formulars[key];
            formular = formular.replace(pattern,function(mat){
                var matchstr = mat.slice(2,-1);
                var tmp = $("[name='"+matchstr+"']",form).val();
                return (tmp != null) ? tmp : "";
            }); 
            try{
                var val = eval(formular);
                if ( val == Infinity||val == -Infinity||isNaN(val)) {
                    $("[name='"+key+"']",form).val("");
                }else {
                    val=val.toFixed(4); 
                    val=new Number(val);
                    $("[name='"+key+"']",form).val(val);
                } 
                
            }catch(e){
                $("[name='"+key+"']",form).val("");
            }
        }
    },
    _showError : function (element , message) {
        //对于checkbox,radiobox作特殊处理
        if (/radio|checkbox/i.test(element.type)){
            element = element.parentNode.parentNode;
        }
        
        var $parent = $(element).closest(".form-group");
        $parent.addClass("has-error has-feedback");
        
        var $span = $parent.find("span.ui-validate-error");
        if($span.length > 0) {
            $span.removeClass("hide").addClass("show");
            $span.html(message);
        }else {
            $("<span class='ui-validate-error help-block show'>"+message+"</span>").appendTo($parent.children('div').first());
        }
    },
    _hideError : function (element) {
        //对于checkbox,radiobox作特殊处理
        if (/radio|checkbox/i.test(element.type)){
            element = element.parentNode.parentNode;
        }
        
        var $parent = $(element).closest(".form-group");
        $parent.removeClass("has-error has-feedback");
        
        var $span =$parent.find("span.ui-validate-error");
        $span.removeClass("show").addClass("hide");
        $span.html("");
    },
    validateForm : function () {
        var self = this ,
            $ele = this.element;
        if($ele.length > 0) {
            var form = $ele[0],
                elements = form.elements;
            
            if (elements) {
                for (var i = 0 ; i < elements.length ; i++) {
                    if(!self.validateEle(elements[i])){
                        return false;
                    }
                }
            }
            
            var flag = false;
            for (var t in this.options.formulars){
                flag = true;
                break;
            }
            
            if(flag){
                this.caculateEle();
            }
            return true;
        }
        return false;
    }
});

$.widget( "ui.page",{
    options : {
        headTemplate : null ,
        rowTemplate : null ,
        rowHandler : null,
        oddRowClass : null,
        evenRowClass : null,
        footTemplate : "",
        // page object contains data info and page info 
        page : null,
        //used for generate page url
        url : null,
        data : null,
        check : true,
        subStr: null,
        pageOption : {
            totalPageNum : null , //总页面数
            currentPageNo : 1 , //当前所在页面
            pageSize : 15 , //record number displayed per page
            displayEntriesNum : 3 , //main display page num
            edgeEntriesNum : 1 ,//edge display page num
            firstAnchorText : "首页",
            previousAnchorText : "«",
            nextAnchorText : "»",
            lastAnchorText : "末页"
        },
        cb: null
    },
    _create : function () {
        var table = this.element;
        if($("thead",table).length == 0) {
            table.append("<thead></thead>");
        }
        if($("tbody",table).length == 0) {
            table.append("<tbody></tbody>");
        }
        if($("tfoot",table).length == 0) {
            table.append("<tfoot class='text-right'><tr><td colspan='1000' style='width: 100%;'></td></tr></tfoot>");
        }
    },
    _init : function (){
        var o = this.options,
            table = this.element,
            check = o.check;
            
        if(o.headTemplate) {
            $("thead",table).html(o.headTemplate);
        }
       
    },
    //construct tbody and tfooter using page object
    showPage : function (currentPageNo , pageData , url , data, cb){
        var self = this ,
            o = this.options,
            table = this.element,
            rtmpl = o.rowTemplate,
            rhandler = o.rowHandler,
            oClass = o.oddRowClass,
            eClass = o.evenRowClass,
            check = o.check,
            page = null;
        
        cb && (o.cb=cb)

        o.page = null;
        if(url) {
            o.url = url;
            o.data = data;
        }
        if(pageData == null && o.url){
            
            $.ajax({
                url: o.url + (o.url.indexOf('?') >= 0 ? '&' : '?')+"pageNo="+currentPageNo ,
                data: o.data ,
                type: "POST" ,
                beforeSend: function(){
                    $(table).parent().layover();
                },
                success: function(data){
                    _callback(data);
                    $(table).parent().layover('disable');
                },
                error: function() {
                    $(table).parent().layover('disable');
                    $.message('danger','获取数据请求失败!');
                }
            });
            return;
        }
        
        _callback(pageData);
        function _callback(pageData) {
            if(pageData) {
            
                if(preHandleResult(pageData))
                    return ;
                
                try {
                    page = $.parseJSON(pageData);
                    //将page对象放到option中,添加对查询结果为空的验证
                    o.page = page;
                }catch(e) {
                    return $.message('danger','数据解析失败!');
                }
            }else {
                return ;
            }
            
            if (page.headTemplate) {
                var head = $("thead",table);
                head.empty().append(page.headTemplate);
            }
            
            //Step 1. construct tbody
            var body = $("tbody",table);
            
            body.empty();
            
            if(check) {
                $("thead",table).find("input[type='checkbox']").iCheck('uncheck');
            }
             
            var colspanSize=$("thead",table).find("th").length;
            if(colspanSize==0){
                colspanSize=100;
            }
            
            if(page.rowTemplate && page.rowTemplate.length >0){
                rtmpl = page.rowTemplate;
            }
            
            if(page.result.length==0){                      //add by wangaq 2015年11月25日9:45:47 增加如果没有记录则显示 查询无结果
                var info = '<div class="alert alert-info" role="alert">'+
                                '<h3 class="text-center" style="margin: 12px 0;font-size:18px;">'+
                                    '<i class="fa fa-info-circle"> 查询无结果</i>'+
                                '</h3>'+
                            '</div> ';
                body.append("<tr><td colspan='"+colspanSize+"'>"+info+"</td></tr>");
            }
            
            $.each(page.result, function( i , data ){
                //substitute variable for rowTemplate
                var row = generateRow(data , rtmpl , rhandler,o.subStr,colspanSize);
                
                var tr = $(row);
                
                if(check){
                    tr.prepend('<td><input type="checkbox" class="icheckbox" value="'+i+'"></td>');
                }
                 
                //add evenRowClass
                if(oClass && i%2 == 0){
                    tr.addClass(oClass);
                }
                if(eClass && i%2 == 1){
                    tr.addClass(eClass);
                }
                body.append(tr);
            });
            
            //Step 2. create pagination
            o.pageOption.totalPageNum = page.totalPageCount;
            if(currentPageNo > 0 && currentPageNo <= o.pageOption.totalPageNum) {
                o.pageOption.currentPageNo = currentPageNo;
            }else {
                return ;
            }
            generatePagination.call(self);
            
            GLOBAL.plugins.checkbox(table);
            
           if(check){
                var $head = $("thead", table).find('.icheckbox');
                $head.on('ifChecked', function() {
                    $("tbody", table).find('.icheckbox').iCheck('check')
                }).on('ifUnchecked', function() {
                    $("tbody", table).find('.icheckbox').iCheck('uncheck')
                })
            }
            if($(".showDetail",table).length > 0) {
                table.on('click', '.showDetail', function(){
                    var url = $(this).data('url') || '';
                    var download = $(this).data('download') || '';
                    if(!url) return;
    
                    $.req(url, {}, function(result){
                        result = JSON.stringify(result);
                        if(!preHandleResult(result)){
                            var result = JSON.parse(result);
                            var dataTable = $('#modal-showDetail').find('table');
                            var table = dataTable.page({check: false });
                            table.page('showPage', 1, result, url, null);
                            $('#modal-showDetail').modal('show');

                            if(download) {
                                $('#modal-showDetail .download').off('click').on('click', function(){
                                    var frameName = 'iframeDownload' + (new Date().getTime()),
                                        frameSrc = download;

                                    var $frame = $('<iframe>');
                                    $frame.attr('name', frameName).attr('src', frameSrc).css('display', 'none');
                                    $('body').append($frame);
                                })
                            }

                        }
                    })
                                
                })
            }

            if (o.cb && typeof(o.cb) === 'function') {
                o.cb.call(null, pageData)
            }

            
        }
        

    },
    getChecked : function(){
        var table = this.element,
            body = $("tbody", table),
            result = [],
            page = this.options.page;

        body.find("input:checked").each(function(i){
            var index = $(this).val(),
                data = page.result[index];
            data._pageIndex = i;
            result.push(data);
        });
        return result;
    }
    
});

$.widget( "ui.datagrid", {
    options: {
        form: null,
        dataTable: null,
        actions: [{
            name: null,
            label: null,
            url: null,
            data: null,
            type: null,//check触发checkbox, page触发page动作, none
            process: null
        }],
        validate: false,
        autoShow: false,
        check: true,
        buttonAuths: null,
        pageOptions: null,
        subStr: null
    },
    _create: function() {
        var _this = this,
            thatElement = this.element,
            form = $("form",this.element),
            panel = $(".panel-datatable",this.element),
            dataTable = $(".dataTable",this.element),
            opts = this.options,
            pageOptions = opts.pageOptions;
            
        //创建建立表单按钮
        var $buttonGroupC = null,
            $buttonGroupH = null,
            classC = 'datagrid-condition-btns',
            classH = 'datagrid-handle-btns';
        if ($('.'+ classC, form).size() === 0) {
            var target = $('fieldset', form).length > 0 ? $('fieldset',form) : form;
            var classname = form.hasClass('form-inline') ? 'form-group' : 'row';
            $buttonGroupC = $('<div>').addClass(classname).addClass(classC).appendTo(target);
        } else {
            $buttonGroupC = $('.'+ classC, form);
        }
        if ($('.'+ classH, panel).size() === 0) {
            var target = $('.panel-datatable', panel).length > 0 ? $('.panel-datatable',panel) : panel;
            $buttonGroupH = $('<div>').addClass(classH).prependTo(target);
        } else {
            $buttonGroupH = $('.'+ classH, panel);
        }
        
        $.each(opts.actions, function(index , action){
            if(opts.buttonAuths && opts.buttonAuths.indexOf(action.name+",") < 0){
                return;
            }
            var target = action.pos==='form' ? $buttonGroupC : $buttonGroupH;
            $icon = $('<i>').addClass(btn_type[action.name] ? btn_type[action.name].font : 'fa fa-search' );
            $anchor = $('<a>').addClass(btn_type[action.name] ? btn_type[action.name].color : 'btn btn-priamry')
                                   .append($icon).append(action.label).appendTo(target);

            if (action.class) {
               $anchor.addClass(action.class);
            }
            
           /**
            * 对应action条件做相应的操作
            * 
            */
            switch (action.type) {
                case 'page':
                    GLOBAL.plugins.checkbox(dataTable);
                    $anchor.on("click.datagrid",function(e){
                        e.preventDefault();

                        if(opts.validate && !form.validate("validateForm")) {
                            return $.message('danger', '信息填写错误!');
                        }

                        if(action.beforeSubmit && $.isFunction(action.beforeSubmit) && action.beforeSubmit.call(this, e)== false){
                            return ;
                        }
                        $(thatElement).layover();

                        var ajaxOption = {};
                        ajaxOption.url = action.url;
                        ajaxOption.data = form.serializeTrim();
                        ajaxOption.type = "POST"; 
                        ajaxOption.success = function (result, textStatus, jqXHR){
                            $(thatElement).layover("disable");
                            if(!preHandleResult(result)){  
                                var table = dataTable.page({check: opts.check });
                                table.page('showPage', 1, result, this.url, this.data, action.process);
                               
                            }

                        };
                        ajaxOption.error = function(jqXHR, textStatus, errorThrown){
                            console.log( errorThrown)
                            $(thatElement).layover("disable");
                            $.message('danger','系统错误!');
                        };
                        
                        $.ajax(ajaxOption);
                        
                    }).attr('aria-type', 'page');
                    break;
                case 'check':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();
                        var result = dataTable.page("getChecked");
                        
                        if (result.length == 0 ) {
                            return $.message('warning', '请至少选择一条记录');
                        }
                        if (action.process && $.isFunction(action.process)) {
                            action.process.call(_this,result);
                        }
                    });
                    break;
                case 'checkpage':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();
                        var result = dataTable.page("getChecked");
                        
                        if (result.length == 0 ) {
                            return $.message('warning', '请至少选择一条记录');
                        }
                        if (action.process && $.isFunction(action.process)) {
                            action.process.call(_this, result, function(){
                                $('[aria-type="page"]', thatElement).trigger('click');
                            });
                        }
                        
                    });
                    break;
                case 'download':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();

                        var url = action.url;
                        if(!url) return;
                        var result = dataTable.page("getChecked");
                        if(result.length == 0 || result.length > 1) {
                            return $.message('warning', '请选择一条记录');
                        }

                        var frameName = 'iframeDownload' + (new Date().getTime()),
                            frameSrc = url + ((url.indexOf("?") > 0 ) ? "&" : "?") + 'contractId=' + result[0].num;

                        var $frame = $('<iframe>');
                        $frame.attr('name', frameName).attr('src', frameSrc).css('display', 'none');
                        $('body').append($frame);
                        
                        if (action.process && $.isFunction(action.process)) {
                            action.process.call(_this,result);
                        }
                    });
                    break;
                 case 'downloadWithForm':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();

                        var url = action.url;
                        if(!url) return;

                        var frameName = 'iframeDownload' + (new Date().getTime()),
                            frameSrc = url + ((url.indexOf("?") > 0 ) ? "&" : "?")+form.serializeTrim('POST');

                        var $frame = $('<iframe>'),
                    		frame = $frame[0];
                        $frame.attr('name', frameName).attr('src', frameSrc).css('display', 'none');
                        frame.attachEvent ? frame.attachEvent('onload', cb) : frame.addEventListener('load', cb, false);
                        $('body').append($frame);
                        function cb(e) {
                            frame.detachEvent ? frame.detachEvent('onload', cb) : frame.removeEventListener('load', cb, false);

                            var doc = frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
                                result = doc ? doc.body.innerHTML : '';

                            if (action.process && $.isFunction(action.process)) {
                                action.process.call(_this, result);
                            }
                        }
                       
                    });
                    break;
                case 'approve':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();

                        if(!action.url) return;
                        var result = dataTable.page("getChecked");
                        if(result.length == 0 || result.length > 1) {
                            return $.message('warning', '请选择一条记录');
                        }

                        $.req(action.url, {contractId: result[0].num}, function(result) {
                            var result = JSON.parse(result);
                            var compiled = _.template($('#approve-options-tpl').html());
                            var $modal = $('#approve-options-modal');
                            $('.modal-body', $modal).empty().append(compiled({data:result}));
 
                            GLOBAL.plugins.select($modal);
                            $modal.modal('show');

                            $('[data-submit="modal"]', $modal).off('click.modal').on('click.modal', function(e) {
                                e.preventDefault();

                                var url = result.submit_url;
                                var form = $('form', $modal).serializeTrim();
                                $.req(url, form, function(result) {
                                    if ('success' === result){
                                        $.message('success', '操作成功');
                                        $modal.modal('hide');
                                    }else{
                                        $.message('danger', result);
                                    }   
                                })
                            })
                        })

                    })
                    break;
                case 'refresh':
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();
                        if (action.process && $.isFunction(action.process)) {
                            action.process.call(_this, null);
                        }
                        $('[aria-type="page"]', thatElement).trigger('click');
                    });
                    break;
                default:
                    $anchor.on('click.datagrid', function(e) {
                        e.preventDefault();
                        if(action.process && $.isFunction(action.process)){
                            action.process.call(_this, null);
                        }
                    });
            } // switch end

        }); // actions each end
        
        //初始化page
        dataTable.page(pageOptions);

        if (opts.validate) {
            form.validate();
            return;
        }

        if (opts.autoShow) {
            $('[aria-type="page"]', thatElement).trigger('click');
        }
    }
});  

function getScope() {
    return $($('.layout-left .menu-sub.active a').attr('href'));
}

function generatePagination() {
    var self = this ,
        o = this.options,
        pageOption = o.pageOption,
        table = this.element;
    //Step 0 : clear old pagination 
    var prePageDiv = $("tfoot div.ui-page",table);
    if( prePageDiv.length > 0) {
        $("a",prePageDiv).unbind();
        $("select",prePageDiv).unbind();
        prePageDiv.remove();
    }
    
    //Step 1 :count display pageNo interval
    var displayEntriesNum = pageOption.displayEntriesNum;
    var halfDisplayEntriesNum = Math.ceil(displayEntriesNum/2);
    var totalPageNum = pageOption.totalPageNum ;
    var upperLimit = totalPageNum-displayEntriesNum;
    var currentPageNo = pageOption.currentPageNo;
    var start = currentPageNo > halfDisplayEntriesNum ? Math.max(Math.min(currentPageNo - halfDisplayEntriesNum, upperLimit), 1):1;
    var end = currentPageNo > halfDisplayEntriesNum ? Math.min( currentPageNo + halfDisplayEntriesNum, totalPageNum) : Math.min(displayEntriesNum, totalPageNum);

    //Step 2: generate anchors
    var pageDiv = $("<div class='ui-page'></div>");

    function generateItem(pageNo , anchorText , anchorClass) {
        var a;
        pageNo = pageNo < 1 ? 1 :( pageNo > totalPageNum ? totalPageNum : pageNo);// pre and next 
        if ( pageNo == currentPageNo && anchorClass == null) {
            a = $("<span class='ui-page-current'>"+anchorText+"</span>");
        }else if( pageNo == currentPageNo && anchorClass != null ) {
            a = $("<span class='ui-page-disable'>"+anchorText+"</span>");
        }else {
            a = $("<a href='#'>"+anchorText+"</a>").bind("click.page",function (e) {
                //:TODO bind click event
                self.showPage(pageNo);
            });
        }
        if(anchorClass) {
            a.addClass(anchorClass);
        }
        pageDiv.append(a);
    }
    
    //generate first anchor
    generateItem(1 , pageOption.firstAnchorText,"ui-page-first");
    //generate previous anchor
    generateItem(currentPageNo - 1 , pageOption.previousAnchorText,"ui-page-prev");

    var i;
    if(start > 1 && pageOption.edgeEntriesNum > 0 ){
        var edgeEnd = Math.min(pageOption.edgeEntriesNum , start);
        for ( i = 1 ; i <= edgeEnd ; i++ ){
            generateItem( i , i );
        }
        if(i < start){
            pageDiv.append("<span>...</span>");
        }
    }

    //generate page 
    for(  i = start; i <= end; i++ ){
        generateItem( i , i );
    }

    if(end < totalPageNum && pageOption.edgeEntriesNum > 0 ) {
        if( end < totalPageNum - pageOption.edgeEntriesNum) {
            pageDiv.append("<span>...</span>");
        }
        var edgeBegin = Math.max(totalPageNum - pageOption.edgeEntriesNum + 1, end);
        for( i = edgeBegin ; i <= totalPageNum ; i++) {
            generateItem( i , i );
        }
    }

    //generate next anchor
    generateItem(currentPageNo + 1 , pageOption.nextAnchorText , "ui-page-next");
    //generate last anchor 
    generateItem(totalPageNum , pageOption.lastAnchorText , "ui-page-last");
    
    //添加页面跳转控件
    var pageGoto = null;
    
    if (totalPageNum <= 100) {
        pageGoto = $("<select>");
        for ( i = 1 ; i <= totalPageNum ; i++){
            if( i == currentPageNo) {
                pageGoto.append("<option selected='selected'>"+i+"</option>");
            }
            else {
                pageGoto.append("<option>"+i+"</option>");
            }
        }
        pageGoto.bind("change.page",function(){
            self.showPage(parseInt($(this).val()));
        });
    } else {
        pageGoto = $('<input class="ui-goto-page" placeholder="1-'+totalPageNum+'">');
        pageGoto.on('keyup', function(e){
            if(e.keyCode === 13) {
                var val = $.trim($(this).val());
                if(val === '') {
                    $(this).val('');
                    return $.message('danger', '页数不能为空！');
                }
                if($.isNumeric(val)){
                    if(val > totalPageNum){
                        $(this).val('');
                        return $.message('danger', '页数不得大于'+totalPageNum+'页！');
                    }
                    self.showPage(parseInt(val));
                } else {
                    $(this).val('');
                    $.message('danger', '请勿输入数字以外的字符！');
                }
            }
        })
    }
    
    
    pageDiv.append("<span>跳转至第</span>").append(pageGoto).append("<span class='last'>页</span>");
    $("tfoot td",table).append(pageDiv);
}

function generateRow(data , rtmpl , rhandler,subStr,colspanSize) {
    if(rhandler && $.isFunction(rhandler)) {
        return rhandler(data);
    }else if(rtmpl) {
        return rtmpl.replace(pattern,function(mat){
            var matchstr = mat.slice(2,-1);
            var tmp = data,
                sp = matchstr.split(".");
            for(var i = 0 ; tmp && i < sp.length ; i++) {
                var spstr =  sp[i];
                tmp = tmp[spstr];
            }
            tmp=(tmp != null) ?tmp:"";
            if(subStr && tmp.length>subStr){                //如果字符太长，显示点点点，进行截取字符串
                tmp=tmp.substring(0,subStr)+"...";
            }
            //tmp.replace(/</g,"&lt;") /</g是正则表达式的写法 可以实现replaceAll 王阿强增加 2015年11月10日14:02:59 原因：解决结果中含有html代码，页面显示html代码转换后的情况
            //比如: <html><input type="button">ff</input></html>  前端只输出ff的情况
            tmp=(tmp + "").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            return tmp;   
        }); 
    } else {
        return "<tr><td colspan='"+colspanSize+"'></td></tr>";
    }
}

function preHandleResult(result) {
    //针对MIISPROJ中,会话超时的情况进行特殊处理
    var startIndex = result.indexOf("<SCRIPT LANGUAGE=\"JavaScript\">");
    var endIndex = result.indexOf("</SCRIPT>");
    if( startIndex != -1 && endIndex != -1) {
        var script = result.substring(startIndex + "<SCRIPT LANGUAGE=\"JavaScript\">".length , endIndex);
        $.message('warning', '用户会话超时请重新登录!');
        eval(script);
        return true;
    }
    
    //针对MIISPROJ中,错误信息进行处理  
    var errorflag = result.substring(0,5);
    if(errorflag == 'error') {
        if(result.length == 5){
            $.message('danger', '用户操作失败!');
        }else {
            $.message('info', result.substring(5));
        }
        return true;
    }
    return false;
}

})(jQuery);
