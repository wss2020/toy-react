
const RENDER_TO_DOM = Symbol("render to dom");

export class Component {
    constructor() {
        this.props = Object.create(null);
        this.children = [];
        this._root = null;
        this._range = null;
    }

    setAttribute(name, value) {
        this.props[name] = value;
    }

    appendChild(component) {
        this.children.push(component);
    }

    get vdom(){
        return this.render().vdom;
    }

    [RENDER_TO_DOM](range) {
        this._range = range;
        this.render()[RENDER_TO_DOM](range);
    }

    rerender() {
        let oldRange = this._range;
        let range = document.createRange();
        range.setStart(oldRange.startContainer, oldRange.startOffset);
        range.setEnd(oldRange.startContainer, oldRange.startOffset);
        this[RENDER_TO_DOM](range);

        oldRange.setStart(range.endContainer, range.endOffset);
        oldRange.deleteContents();
    }

    setState(newState) {
        if (this.state === null || typeof this.state !== "object") {
            this.state = newState;
            this.rerender();
            return;
        }
        let merge = (oldState, newState) => {
            for (let p in newState) {
                if (oldState[p] === null || typeof oldState[p] !== "object") {
                    oldState[p] = newState[p];
                } else {
                    merge(oldState[p], newState[p])
                }
            }
        };
        merge(this.state, newState);
        this.rerender();
    }
}

/**
    好，接下来我们到 main.js 里面去看一个，我们这里不做 render 了，我们创建一个 game ,然后我们来把 game 的 vdom 取出来，
 看看它的vdom 是不是跟我们想象中的一样，  1.png 是打印出来的 dom 树，可以看到这个 div 是没有 children ，因为这个 toy-react
 里面，我们没有把 ElementWrapper、setAttribute 和 appendChild 干掉，我们必须把它干掉，这样它才能够调到原本的 Component 上
 的对应的两个方法，它才会有 children 和 Attribute ,那么这个时候，我们对 ElementWrapper ,实际上是 这个被删掉的代码，它还会有
 用，那么什么时候有用，那么我们需要把它挪到 RENDER_TO_DOM 的逻辑里面来，这个我们后面再做啊，我们先把它删掉，然后webpack ,好这个，

 **/
class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.type = type;
        this.root = document.createElement(type);
    }
    // setAttribute(name, value) {
    //     if (name.match(/^on([\s\S]+)/)) {
    //         this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
    //     } else {
    //         if (name === "className") {
    //             this.root.setAttribute("class", value);
    //         } else {
    //             this.root.setAttribute(name, value);
    //         }
    //     }
    // }
    // appendChild(component) {
    //     let range = document.createRange();
    //     range.setStart(this.root, this.root.childNodes.length);
    //     range.setEnd(this.root, this.root.childNodes.length);
    //     component[RENDER_TO_DOM](range);
    // }

    get vdom() {
        return {
            type: this.type,
            props: this.props,
            children: this.children.map(item => item.vdom)
        }
    }



    [RENDER_TO_DOM](range) {
        range.deleteContents();
        range.insertNode(this.root);
    }

}

class TextWrapper extends Component{
    constructor(content) {
        super(content);
        this.root = document.createTextNode(content);
    }

    get vdom(){
        return{
            type: "#text",
            content: this.content,
        }
    }

    [RENDER_TO_DOM](range) {
        range.deleteContents();
        range.insertNode(this.root);
    }
}



export function createElement(type, attributes, ...children) {
    let e;
    if (typeof type === "string") {
        e = new ElementWrapper(type);
    } else {
        e = new type;
    }
    for (let p in attributes) {
        e.setAttribute(p, attributes[p]);
    }
    let insertChildren = (children) => {
        for (let child of children) {
            if (typeof child === 'string') {
                child = new TextWrapper(child);
            }
            //加一个逻辑
            if (child === null) {
                continue;
            }
            if ((typeof child === "object") && (child instanceof Array)) {
                insertChildren(child);
            } else {
                e.appendChild(child);
            }
        }
    };
    insertChildren(children);
    return e;
}


export function render(component, parentElement) {
    let range = document.createRange();
    range.setStart(parentElement, 0);
    range.setEnd(parentElement, parentElement.childNodes.length);
    range.deleteContents();
    component[RENDER_TO_DOM](range);
}









