const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
       this.root = document.createElement(type);
    }

    setAttribute(name,value) {
       this.root.setAttribute(name,value);
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









