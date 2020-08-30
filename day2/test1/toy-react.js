// 这里我们的component ，已经是一个具备初步交互能力的component,
// 但是我们的API 还跟 React 不一样，
// 我们看这里的API,


const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
       this.root = document.createElement(type);
    }

    // 这里补上onclick 的逻辑。
    setAttribute(name,value) {
        // 这里我们要过滤一下name,如果name它是以on开头的，那么我们要做一些特殊处理。
        // 这里用到了一个正则表达式的小技巧， 小s大S加上方括号，因为这两个正好是互补的两个集合。
        // 一个是所有空白，一个是所有的非空白，所以说 S s 这样写在一起，加上方括号就表示所有的字符
        // 一般来说，我们也会有这个方式来表示所有的字符，这个是正则里面，一个比较稳妥的表达所有字符的这样的一个方式。
        // 它只要是以on开头的，剩下的有多少我们不管，但我们要匹配出来，这个完整的name,
        if(name.match(/^on([\s\S]+)/)){
            // 然后我们会给它做一个事件绑定，这个时候，因为我加了个括号，这个是一个匹配型的括号，
            // 因为我加了这个匹配型的括号，那么它的RegExp的这个$1，就变成了匹配捕获到的这个值。
            // 这是我们就让他绑定这个事件，然后把这个value绑上了，
            // this.root.addEventListener(RegExp.$1,value);


            // click无所谓，但如果说它有的时候，我们说onclick，我们会把c大写，我们为了驼峰的表达式的命名，
            //所以我们要给它第一个字母,给它replace掉,
            //同样，第一个字母，不管是什么，我们就会给它match一下
            // 这样就确保了，它第一个是以小写字母开头
            // 因为我们有些事件，它其实是大小写敏感的，如果你是以大写的开头，它就绑不上这个事件。
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/,c => c.toLowerCase()),value);
        }else{
            this.root.setAttribute(name,value);
        }
    }

    appendChild(component) {
        let range = document.createRange();
        range.setStart(this.root,this.root.childNodes.length);
        range.setEnd(this.root,this.root.childNodes.length);
        component[RENDER_TO_DOM](range);
        // this.root.appendChild(component.root);
    }

    [RENDER_TO_DOM](range) {
       range.deleteContents();  // 内容给它删掉
       range.insertNode(this.root);
    }

}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }

    [RENDER_TO_DOM](range) {
        range.deleteContents();  // 内容给它删掉
        range.insertNode(this.root);
    }
}

export class Component{
    constructor() {
       this.props = Object.create(null);
       this.children = [];
       this._root = null;
       this._range = null;
    }
    setAttribute(name,value) {
       this.props[name] = value;
    }
    appendChild(component) {
       this.children.push(component);
    }

    [RENDER_TO_DOM](range) {
        // 我们有了range之后，我们得把它存起来，才能够去重新绘制，
        //先用一个变量把它保存一下。
        // 我们对口的要对它进行初始化，
        // 即在 constructor 中  this._range = null; 开始都是null
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }

    //这里接下来，我们来写一个，重新绘制的这样的一个算法
    // rerender 我们就叫它 rerender好了
    // rerender 不需要参数，他就是一个简单的指令，发个 class,它就会进行重新绘制，
    // 说起来，逻辑也很简单
    rerender(){
        // 把原来range里面的东西全删掉
        // range.deleteContents();
  this._range.deleteContents();
        // 并且我们再调用一下this的这个 RENDER_TO_DOM 的方法。
        // 这样就写完了，rerender,接下来如何去调用 rerender这个方法。
        // 在 mian.js 中，就是我们自己去写代码的时候，我们是需要一个事件绑定，才能够去做这件事
        //
        this[RENDER_TO_DOM](this._range);
    }

}

export function createElement(type,attributes,...children){
    let e;
    if(typeof  type === "string"){
        e = new ElementWrapper(type);
    }else{
        e = new type;
    }
    for(let p in attributes){
        e.setAttribute(p,attributes[p]);
    }
    let insertChildren = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            if( (typeof  child === "object") && (child instanceof Array) ){
                insertChildren(child);
            }else{
                e.appendChild(child);
            }
        }
    };
    insertChildren(children);
    return e;
}


export function render(component,parentElement){
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}









