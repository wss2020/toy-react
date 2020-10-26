/**
 注意 range 引入的这样一个 Bug ,我们会发现，它后面它会丢东西，这个从右往左
 是没有问题，从左往右是会丢东西的，那么这个其实主要是我们的 range 在处理上，是有
 一个比较难发现的这样的一个 Bug .
 **/


const RENDER_TO_DOM = Symbol("render to dom");

class ElementWrapper {
    constructor(type) {
        this.root = document.createElement(type);
    }

    setAttribute(name,value) {
        if(name.match(/^on([\s\S]+)/)){
            this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/,c => c.toLowerCase()),value);
        }else{
            if(name === "className"){
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
    /**
     在 rerender 的这个位置，我们首先对它做一个 deleteContents ,然后产生一个
     全空的这样的一个range ,而全空的 range ，如果它有相邻的range ,它就能够被吞进去，
     它被吞进了下一个range 里面，然后我们再插入的时候，它就会被后边的range 包含进去，
     可能所以说，我们在rerender 的时候，是需要保证这个 range 是不空的，所以说我们
     在这个地方，是需要去做一个特殊处理，我们为了保证 range 不空，那么我们就需要去先
     插入，然后再去删除，这样呢？我们就没有关系了。
     那么先插入，我们需要先设一个插入的 range ，那么这个地方就是,我们先创建一个
     插入的range ,我们可以把它插到内容之前，这样的话，它的老的range 就不会空，我们
     先创建一个 range ，然后我们给它设上 Start ,Start 我们就根据老的 range 去参
     考，设它的 Start ,startContainer,然后startOffset ,  注意它的插入的点，它
     是一个没有范围的这样的一个点，所以说它一定是最后是 startContainer 和 startOffset ,
     它的起点和终点是一样的，所以这个地方，都用老的 range 的起点就可以了，
     然后之后，我们把 range 作为参数传给 render ,然后我们再把旧的 deleteContents ,
     但是这个里面意思是这么个意思，但是代码不是这样写的，  为什么？因为我们的 RENDER_TO_DOM
     的方法里面，其实已经改掉了它的这个 range 的值，所以说这个地方，我们需要先把老的这个给它
     保存一下，然后我们注意，我们创建新的插入点的 range 的时候，它因为是一个没有宽度的range，
     所以说它其实也在老的range 之内，这样的话，你插入的时候，老的 range 的范围也增大了，那么在
     我们 deleteContents 之前，要给老的 range 的 Start 的节点，给它重设一下，先 Start ,
     那就是新的 range 的 endContainer .
     第一部分是创建一个新的 range ,并且我们把它分成三段，我们再给大家解说一下，因为这个 range
     的逻辑绕来绕去，还是非常麻烦的，老的range 在这里 oldRange 保存下来，然后创建一个新的 range,
     把它设置老的 range 的 Start ,把它放在老的 range 的 Start 的位置，我们这里用 oldRange
     这个变量比较好，然后我们完成插入，完成插入之后，我们把老的 range 的 Start 给它挪到插入的内容
     之后，那么我们再把它的所有的内容删除，这样我们就完成了整个的 rerender ,整个地方大家其实不需要
     去，太在这个地方纠结，因为我们后边整个都是要改掉的，我们要换成虚实Dom 对比的逻辑，这个部分我们就
     完成了，然后我们重新 webpack 一下，然后我们再给它执行起来。
     **/
    rerender() {
        let oldRange = this._range;
        let range = document.createRange();
        range.setStart(oldRange.startContainer,oldRange.startOffset);
        range.setEnd(oldRange.startContainer,oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer,range.endOffset);
        oldRange.deleteContents();
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
            //加一个逻辑
            if( child === null){
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









