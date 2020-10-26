
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
        this._vdom = this.vdom;
        this.render()[RENDER_TO_DOM](range);
    }

/**
    首先rerender 的代码，可以退休了，因为我们不再是重新渲染了，我们是更新，那么 VDOM 的创建和比对的逻辑，都会在
 Component 基类里面去实现，所以说我们主要的更新部分都会在这个里面，所以我们可以把这个rerender 先给它去掉啊，然后
 我们来考虑，如何去实现我们的 VDOM比对，
    那么我们写一个 update 方法，这里面有一个重要的知识，就是 RENDER_TO_DOM 的逻辑 render 了之后，它一定要更新，
 因为它一定要更新，所以说我们这里，就会给它这个 RENDER_TO_DOM 里面的，当时用的这个 vdom ,我们把它存下来，
 this._vdom = this.vdom; 注意这个vdom 是个 get ,所以说这个地方会重新render 并且得到一棵新的 vdom 树，而
 this._range = range;this._vdom = this.vdom; 这个地方它的 RENDER_TO_DOM 的部分，我们就会用 this.vdom
 来执行啊，这样 this._vdom , 它就会充当旧的 vdom ,
    而在 update 里面，我们就把一棵新的 vdom 跟上次渲染得到的旧的vdom ,我们去做一个对比，然后对比之后，然后来决定
 哪一个树的子树，我们要去做重新渲染，我们这里会用一个比较简单的这样的 VDOM 这样的对比算法，就是我们只对比对应位置的VDOM,
 它是不是同一个类型的节点，如果是，我们就进行了，如果它不是，或者说它比如说两个节点调换了顺序，这个 React 里面是可以处理的，
 它会用一个更好的 VDOM 对比算法，那我们今天呢VDOMDiff 了， 因为我们主要还是要给大家讲解 VDOM 的原理。
    update 里面我们可能需要递归地去访问 vdom 的内容，所以说 我们要写一个函数，update ,它会把一棵新的和旧的（节点）给它
 去更新，我们来考虑怎么样写这个 update , 首先是调用 update 的地方，还是在 setState 里面，你那 setState 变了，render
 的结果就可能变，所以我们才需要对比，好，然后我们到 update 里面去看，旧的 vdom 是这个 this._vdom, 新的 vdom 是新渲染出
 来的这个 vdom ,我们需要把新渲染出来的vdom ,给它存一下，
    然后update 了之后，我们就可以认为，它现在已经更新到，这颗新的 vdom 了，所以我们要把旧的这个，给它替换掉，所以 update
 里面的主体逻辑大概就是这个样子，update 里面，我们来考虑一下，两颗树的对比，旧的 和 新的，那么我们肯定首先对比它的根结点，它
 的根节点，我们有几个要素去对比，我们可以简单地列一下啊，
    首先我们要对比它的type ,如果它的 type 不一致的话，那么我们就认为它是完全不同类型的子节点，所以它在这些子树，什么子节点，
 什么的也都没有复用的价值了，完全地重新重构就可以了，
    然后就是它的 props ,props 不一样，那么其实是我们可以通过打 patch 的方式去更改的，因为我们的 vdom 树里面全是
 ElementWrapper , 这样的老实的节点，所以它不会有什么特殊的逻辑，这样我们可以把这个 props 打 patch ，但是我们这里，
 也去，就是简化这个逻辑，那么如果 props 不一样，我们也认为它根节点不一样，只用根节点的 type 和 props 完全一致，那么
 我们认为这个根节点是不需要更新的，然后我们再去看它的所有的子节点是不是需要更新，然后我们再去看它的 children ，值得注
 意的是，一旦 types 是 text 的时候，我们还需要看 content , 而这个 content 其实我们也是可以去通过 patch 的方式，
 去更新的啊，这里我们也用一个直接的这种 replace 的方式，所以说这个逻辑，我们就大概梳理清楚了。
    所以我们这个逻辑会分成两段，第一段是对比这个根节点是否一致的，第二段是对比它的 children 是否一致的，而这个对比
 children 是否一致，正是各种各样的这种 Diff 算法，它们登场的舞台，这里我们就用一个最土的同位置的比较的方法，它也能
 实现局部更新，好，我们来看，根节点怎么对比。
 **/
    update(){
        let update = (oldNode, newNode)=>{
            // type, props, children
            // #text
        }
        let vdom = this.vdom;
        update(this._vdom,vdom);
        this._vdom = vdom;
    }
    // rerender() {
    //     let oldRange = this._range;
    //     let range = document.createRange();
    //     range.setStart(oldRange.startContainer, oldRange.startOffset);
    //     range.setEnd(oldRange.startContainer, oldRange.startOffset);
    //     this[RENDER_TO_DOM](range);
    //
    //     oldRange.setStart(range.endContainer, range.endOffset);
    //     oldRange.deleteContents();
    // }

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

    get vdom() {
        return this;
    }

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









