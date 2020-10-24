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

/**
    所以接下来，我们就在这个 toy-react.js 里面，实现它的重头戏，就是这个 setState .
    我们先写上这个方法,setState 会假设我们已经有了一个 state 这样的一个方法,我们这样做一个这种
 深拷贝 的合并。 所以说我们首先假设，已经有state这个方法了，但state有可能是null,所以我们写一个
 递归的形式去访问它，每一个的这种对象和属性，
    所以我们会写一个 merge，merge它会用一个 oldState 和一个 newState，然后我们 merge ,它会
 被递归的调用，merge 最终的调法 merge(this.state,newState); ，
    然后 merge 里面怎么写，merge 里面我们就是 for 循环它的所有子节点，然后去merge，
 为了防止 oldState直接上来就是null， 我们最前面给它一个 state ，不过这个state 直接就是null ,
 或者说它根本不是对象，那么我们就会直接，this.state = newState; 我们直接给它替换掉，然后直接
 return 掉，这是个短路逻辑， 这里我们还要先调用一下 rerender ，这就可以了。
    然后，我们来写这个 merge ，merge 的话，我们假设，假设 oldState,newState 都是object，
 两个对象的这种merge ，我们就会采用 for in 来去 merge ，我们会把 newState 里面所有的属性，
 给它抄写到 oldState 上面，如果 oldState 的 p 属性，它这个 p 属性，它如果是一个对象的话，那
 么我们就会执行合并，那么我们同样是会判断，我们跟前面一致好了，都用这个等于 null ,这里面有一个坑，
    注意：null 的typeof的结果也是object,所以一定要把null拿出来单独去判断，这是JavaScript 里
 面著名的一个坑，如果你不注意，这个地方就会很惨，它会给你制造各种稀奇古怪的麻烦，所以大家记住，typeof
 的结果判定的时候，一定要跟等于null联合使用，尤其是涉及到object的时候。
    然后这个地方 p ,那么如果它俩不是 object 的话，那我们就直接给它抄写上，就是 oldState[p] = newState[p];，
 我们就直接给它 copy 上去了， 如果它不是，它是一个对象，那么我们就会递归地调用 merge，这里做的是
 一个深拷贝的一个设计。
    然后，都成功了以后，同样要调用这个 rerender。
*/
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









