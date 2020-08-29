// 这一版，改造之后，RENDER_TO_DOM 的这个range,我们就有了可以重新渲染的能力。
// 这样就完成了一个基于range的这样的一个DOM绘制之后。
// 接下来，就可以考虑如何去实现重新的绘制了。
// 特别一提，这个重新绘制，对于我们的下一个步骤，就是我们的虚拟Dom，也是至关重要的。
//  如果没有重新绘制的话，其实也就没有虚拟Dom什么事了，
//  如果只是绘制一遍的话，其实它不存在虚实Dom比对的这样的一个事情。
//所以说，接下来的改造，就是要给组件加入，重新绘制和渲染的能力。

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
    }
    setAttribute(name,value) {
       this.props[name] = value;
    }
    appendChild(component) {
       this.children.push(component);
    }

    // 什么API 是跟位置对应，range API
    //传进来一个，range进来，使用range API，去对它进行操作和重新渲染了。
    //思想要发生变化，不再用root进行操作，我们从取一个元素变成了，把它渲染进一个 range 里面，
    // 这个地方，实际上会是一个 this.render
    //这里用下划线表示 它是私有。   更好的方式其实是用一个 Symbol
    // _renderToDom(range) {
    [RENDER_TO_DOM](range) {
        this.render()[RENDER_TO_DOM](range);
    }

    // get root(){
    //     if(!this._root){
    //         this._root = this.render().root;
    //     }
    //     return this._root;
    // }
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


// 补充，range 是由一个Start 的节点和一个 End的节点组成的，
// Start的节点，我们肯定选 parentElement
// 这里 offset 我们选为 0，意味着它是从 Element 的 第一个 children 到 最后一个children.
//接着我们还要把 content 给它删掉，
//setEnd的时候，不能再选0了，我们要选childNodes的长度，
// 这里写的是childNodes，不能写 children,因为我们parentElement里面，是可能有文本节点和注释节点的。
// 我们要把它首尾都设成正确的值。
export function render(component,parentElement){
    // parentElement.appendChild(component.root);
    let range = document.createRange();
    range.setStart(parentElement,0);
    range.setEnd(parentElement,parentElement.childNodes.length);
    range.deleteContents(); // 把range里面的东西都删干净。
    //让后再给它 component 里面的东西再渲染进去，
    component[RENDER_TO_DOM](range);
}









