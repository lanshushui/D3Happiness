/* jshint esversion: 6 */
(function (window, document) {
    let Selector = function (option) {
        //执行初始化方法，
        this._init(option);
    };

    Selector.prototype = {
        //初始化传入参数并定义初始化的相关变量
        _init({
            eleSelector = "", //传入的选择器 id,class，tag等，用于将选择框渲染到此选择器所在的元素
            options = [{
                name: "请选择",
                value: "0",
            }], //传入的下拉框对象，name为选择的文字，value为值
            defaultText = "请选择" //提供的默认选择的值
        }) {
            
            //将传入的数据绑定到this上
            this.parentEle = document.querySelector(eleSelector) || document.body; //要邦定的dom 
            this.options = options; //选择值数组对象
            this.defaultText = defaultText; //默认值

            this.dropboxShow = false; //定义存储下拉框的显示隐藏状态
            this.defaultValue = ""; //定义村赤默认选中的值
            this._creatElement(); //初始化后执行创建元素方法
        },

        //创建下拉选择框dom
        _creatElement() {
            //选择框最外层的包裹元素
            let wrapEle = document.createElement("div");
            wrapEle.className = "my-select";

            //根据传入的值获取选择框默认的值和内容
            this.options.forEach(item => {
                if (item.name === "this.defaultText") {
                    this.defaultValue = item.value;
                }
            });

            let selectWarpBox = document.createElement("div"); //选择框包裹元素
            selectWarpBox.className = "select-selection";

            let inputHideBox = document.createElement("input"); //隐藏保存选择值得元素
            inputHideBox.type = "hidden";
            inputHideBox.value = this.defaultValue;

            let selectShowBox = document.createElement("div"); //选择框默认展示框
            selectShowBox.style.height="100%";
            let selectNameBox = document.createElement("span"); //选择框展现的值ele
            selectNameBox.className = "select-selected-value";
            selectNameBox.id = "select-option";
            selectNameBox.innerText = this.defaultText; //将传入的默认值赋值
            let selectIcon = document.createElement("i"); //图标ele
            selectIcon.className = "arrow-down icon-select-arrow";
            //将span和角标添加到外层div
            selectShowBox.appendChild(selectNameBox);
            selectShowBox.appendChild(selectIcon);

            selectWarpBox.appendChild(inputHideBox);
            selectWarpBox.appendChild(selectShowBox);

            //下拉框
            let dropbox = document.createElement("div"),
                ulbox = document.createElement("ul");

            dropbox.id = "select-drop";
            dropbox.className = "select-dropdown";
            ulbox.className = "select-dropdown-list";
            //遍历传入的选项数组对象，生成下拉菜单的li元素并赋值
            this.options.forEach((item) => {
                let itemLi = document.createElement("li");
                if (this.defaultText === item.name) {
                    itemLi.className = "select-item select-item-selected";
                } else {
                    itemLi.className = "select-item";
                }

                itemLi.setAttribute("data-value", item.value);
                itemLi.innerText = item.name;
                ulbox.appendChild(itemLi);

            });
            //将下拉框ul推入到包裹元素
            dropbox.appendChild(ulbox);

            wrapEle.appendChild(selectWarpBox);
            wrapEle.appendChild(dropbox);

            this.parentEle.appendChild(wrapEle); //将生成的下拉框添加到所选元素中

            //把需要操作的dom挂载到当前实例
            //this.wrapEle = wrapEle;     //最外层包裹元素
            this.eleSelect = selectWarpBox; //选择框
            this.eleDrop = dropbox; //下拉框
            this.eleSpan = selectNameBox; //显示文字的span节点

            //绑定事件处理函数
            this._bind(this.parentEle);
        },

        //点击下拉框事件处理函数
        _selectHandleClick() {
            if (this.dropboxShow) {
                this._selectDropup();
            } else {
                this._selectDropdown();
            }
        },

        //收起下拉选项
        _selectDropup() {
            this.eleDrop.style.transform = "scale(1,0)";
            this.eleDrop.style.opacity = "0";
            this.eleSelect.className = "select-selection";
            this.dropboxShow = false;
        },

        //展示下拉选项
        _selectDropdown() {
            this.eleDrop.style.transform = "scale(1,1)";
            this.eleDrop.style.opacity = "1";
            this.eleSelect.className = "select-selection select-focus";
            this.dropboxShow = true;
        },

        //点击下拉选项进行赋值
        _dropItemClick(ele) {
            this.defaultValue = ele.getAttribute("data-value");
            //document.querySelector("#select-value").value = ele.getAttribute("data-value");
            this.eleSpan.innerText = ele.innerText;
            ele.className = "select-item select-item-selected";
            //对点击选中的其他所有兄弟元素修改class去除选中样式
            this._siblingsDo(ele, function (ele) {
                if (ele) {
                    ele.className = "select-item";
                }
            });
            this._selectDropup();
            drawScatterChart(this.defaultValue);
        },

        //node遍历是否是子元素包裹元素
        _getTargetNode(ele, target) {
            //ele是内部元素，target是你想找到的包裹元素
            if (!ele || ele === document) return false;
            return ele === target ? true : this._getTargetNode(ele.parentNode, target);
        },

        //兄弟元素遍历处理函数
        _siblingsDo(ele, fn) {

            (function (ele) {
                fn(ele);
                if (ele && ele.previousSibling) {
                    arguments.callee(ele.previousSibling);
                }
            })(ele.previousSibling);

            (function (ele) {
                fn(ele);
                if (ele && ele.nextSibling) {
                    arguments.callee(ele.nextSibling);
                }
            })(ele.nextSibling);

        },

        //绑定下拉框事件处理函数
        _bind(parentEle) {
            let _this = this;
            //事件委托到最外层包裹元素进行绑定处理
            parentEle.addEventListener("click", function (e) {
                const ele = e.target;
                
                //遍历当前点击的元素，如果是选中框内的元素执行
                if (_this._getTargetNode(ele, _this.eleSelect)) {
                    if (_this.dropboxShow) {
                        _this._selectDropup();
                    } else {
                        _this._selectDropdown();
                    }
                } else if (ele.className === "select-item") { //如果是点击的下拉框的选项执行
                    _this._dropItemClick(ele);
                } else { //点击其他地方隐藏下拉框
                    _this._selectDropup();
                }

            });

        }

    };
    //将构造函数挂载到全局window
    window.$Selector = Selector;
})(window, document);
