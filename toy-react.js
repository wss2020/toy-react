// 这里我们来实现 toy-react.js 的重头戏。
// 就是这个  setState


const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
       this.root = document.createElement(type);
    }

    setAttribute(name,value) {
        if(name.match(/^on([\s\S]+)/)){
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
    }

    [RENDER_TO_DOM](range) {
       range.deleteContents();
       range.insertNode(this.root);
    }

}

class TextWrapper {
    constructor(content) {
        this.root = document.createTextNode(content);
    }

    [RENDER_TO_DOM](range) {
        range.deleteContents();
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
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }

    rerender() {
        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range);
    }

    //我们先写上这个方法
    // setState 会假设我们已经有了一个 state 这样的一个方法。
    // 我们这样做一个这种 深拷贝 的合并。
    // 所以说我们首先假设，已经有state这个方法了，但state有可能是null
    // 所以我们写一个递归的形式去访问它，每一个的这种对象和属性，
    setState(newState){

        //为了防止 oldState直接上来就是null
        if(this.state === null || typeof this.state !== "object"){
            this.state = newState;
            this.rerender();
            return;
        }


        // 所以我们会写一个 merge，merge它会用一个 oldState 和 一个 newState，
        // merge 里面我们就是 for 循环它的所有子节点，然后去merge
        let merge = (oldState,newState){
            // 假设 oldState,newState 都是object
            for(let p in newState){
            // 注意：null 的typeof的结果也是object,所以一定要把null拿出来单独去判断。
                if(oldState[p] === null || typeof this.state !== "object"){

                }
            }
        }

        // merge 它会被递归的调用，最终的调法：
        merge(this.state,newState)
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









