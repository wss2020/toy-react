
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

    get vdom() {
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
 接下来我们来看一看我们，setAttribute 和 appendChild 里面做的事情，我们就要让它在 RENDER_TO_DOM 这个
 里面去做，
 **/
class ElementWrapper extends Component {
    constructor(type) {
        super(type);
        this.type = type;
        this.root = document.createElement(type);
    }

    /**
     这个地方我们返回了一个新对象，这个返回新对象的操作，其实是有问题的，这是我们为了让这颗 VDOM 树比较干净而操作的，
     如果这个对象上面没有办法，我们就没有办法完成重绘，所以说这个地方，我们希望达成的是一个 return this,而 return this
     了之后，实际上我们所有的 ElementWrapper ,就是它所有的节点，那么 text 也一样，我们给它 return this,
     注意这里面会有一个区别，就是这个 children , 它就变成了组件的 children ,那么我们为了让 vdom 的 children 能
     够正确，我如果需要的话，我们给它加一个 vchildren ,
     **/
    get vdom() {
        return this;
    }

    /**
     root 没有了，我们需要自己建一个root ,它创建一个什么 Element ,它会根据 this.type 来的，这个时候，我们
     把它延迟到，RENDER_TO_DOM 里面去创建这个 root , 然后所有的 props 里面，所有的 props 里面的内容，我们要
     给它抄写到这个 Attribute 上，所以这里，我们用一个 for in 循环，注意这个地方，因为是访问对象的所有属性，所以
     我们用 for in ,这个操作，其实我们就可以把 setAttribute 这个里面的，给它拷贝过来了，
     好，处理完这个 props ，其实一个 Element 上有效的虚拟Dom的属性，它就是root props 和 children,
     那么我们再把它的 children 处理一下，因为 children 是一个数组，所以这个地方用 of ,我们获取它的
     children ,然后这里的每个 child 其实是个 Component ,这个时候，我们其实是可以把 appendChild 给它
     拿出来，因为我们已经用了 range 了，所以我们要给它改名字，你叫它 childRange 好了，这个所有的 this.root
     都给它改成 root ,这样我们就完成了这个，整个的虚拟DOM 到实体DOM 的更新。
     **/
    [RENDER_TO_DOM](range) {
        range.deleteContents();

        let root = document.createElement(this.type);

        for (let name in this.props) {
            let value = this.props[name];
            if (name.match(/^on([\s\S]+)/)) {
                root.addEventListener(RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()), value);
            } else {
                if (name === "className") {
                    root.setAttribute("class", value);
                } else {
                    root.setAttribute(name, value);
                }
            }
        }

        for (let child of this.children) {
            let childRange = document.createRange();
            childRange.setStart(root, root.childNodes.length);
            childRange.setEnd(root, root.childNodes.length);
            child[RENDER_TO_DOM](childRange);
        }

        range.insertNode(root);
    }

}

/**
 那么 text 也一样，我们给它 return this,注意这里面会有一个区别，就是这个 children , 它就变成了组件的
 children ,那么我们为了让 vdom 的 children 能够正确，我如果需要的话，我们给它加一个 vchildren ,
 **/
class TextWrapper extends Component {
    constructor(content) {
        super(content);
        this.type = "#text";
        this.content = content;
        this.root = document.createTextNode(content);
    }

    get vdom() {
        return this;
    }

    get vchildren() {
        return this.children.map(child => child.vdom);
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









