
const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
       this.root = document.createElement(type);
    }

    setAttribute(name,value) {
        if(name.match(/^on([\s\S]+)/)){
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/,c => c.toLowerCase()),value);
        } else{
            if(name== "className"){
                this.root.setAttribute("class",value);
            }else{
                this.root.setAttribute(name,value);
            }
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


    // 点击 Tutorials 发现会有东西丢失
    //
    rerender() {
        // 运行 deleteContents 产生了一个全空的这样的一个range,
        // 如果全空的range,它有相邻的range,它就能够被吞进去，它被吞进了下一个range里面，
        //  然后我们再插入的时候，它就被会后面的range包含进去。
        //  所以我们在rerender的时候，是需要保证这个range是不为空的。
        // 为了保证range不空，我们需要先插入，然后再去删除，这样我们就没有关系了。
        // 先插入，我们需要先设一个插入的range,
        // 注意他的插入的点，它是一个没有范围的这样的一个点，它一定是最后是一个 startContainer 和 startOffset， 起点和终点是一样的。
        // 所以这里都用老的range的起点，就可以了。
        let range = document.createRange();
        range.setStart(this._range.startContainer,this._range.startOffset);
        range.setEnd(this._range.startContainer,this._range.startOffset);

        this._range.deleteContents();
        this[RENDER_TO_DOM](this._range);
    }

    setState(newState){

        if(this.state === null || typeof this.state !== "object"){
            this.state = newState;
            this.rerender();
            return;
        }


        let merge = (oldState, newState)=>{
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p])
                }
            }
        };
        merge(this.state,newState);

        this.rerender();
    }

}

export function createElement(type,attributes,...children){
    console.log('-----------------------');
    console.log(arguments);
    let e;
    if(typeof  type === "string"){
        e = new ElementWrapper(type);
    }else{
        e = new type;
    }
    for(let p in attributes){
        e.setAttribute(p,attributes[p]);
    }

    // insertChildren的时候，如果说这个child是null,
    // 那么我们就不去处理它了
    let insertChildren = (children)=>{
        for(let child of children){
            if(typeof child === 'string'){
                child = new TextWrapper(child);
            }
            if(child === null){
               continue;
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









