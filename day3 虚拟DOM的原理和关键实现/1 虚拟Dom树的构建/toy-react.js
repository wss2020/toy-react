
/**
    现在的代码，它会存在着一个 ElementWrapper 这样的一个 class ，还有一个 TextWrapper ，然后还有一个 Component
 从继承关系上来说，ElementWrapper 和 TextWrapper ，其实也应该属于 Component 的一种，然后呢？我们现在实现 ElementWrapper
 里面的逻辑，全都是针对 root 的一个操作，我们的所有的 ElementWrapper 上的方法，都是相当于 root 这个，真实的 Dom 元素的这
 样的一个代理，
    那么我们要想实现虚拟Dom,首先就需要把这些代理的能力给它去掉，然后我们要真正地去创建一个虚拟Dom,创建虚拟Dom,我们是需要一个
 方法的，我们这里给一个方法，我们用一个 get 来表示，获取一个虚拟 DOM ,我们暂时不去动原来的 setAttribute 和 appendChild,
 还有 RENDER_TO_DOM 的这些方法，那么独立地实现一个虚拟 DOM 的这个，这样的一个方法，
 然后呢，我们发现其实虚拟 DOM 里面，我们对一个 ElementWrapper 来说，虚拟 DOM 要包含三样东西，一个是 type，另一个是它
 的props,还有一个是 children ，但是 this.children ，它会是一个组建的children ，所以说，我们要把它变成vdom 的children，
 那么我们还需要对它进行一个 map ,
    那么我们发现这个type,我们就需要把它存起来，
    然后 props 和 children ,我们上哪去找，其实我们就需要把 setAttribute 和 appendChild 这两个代码，给它做一定的改造，
 我们发现 setAttribute 的时候，其实就是存 this.props、appendChild 的时候，而这个逻辑，刚好其实就是我们的 Component
 里面的逻辑，所以我们把 Component 的这个类的位置，放到前面一点，放到它的最前，然后我们让 ElementWrapper 去 extends
 Component ,extends 完了，调一个 super ,同样 TextWrapper ,我们也给它继承这个 Component ,这样呢，我们的 Component
 就可以默认的有 props 和 children ,有了 props 和 children ,那么我们的 get vdom ,它就可以正确地获取了。
    那么接下来，我们来写 TextWrapper 的 vdom ,TextWrapper 的 vdom 很简单，它可能会多一个 content 的属性，我们在构造
 函数里面，把它存上，就可以了，
    接下来，我们可以实现这个 Component 的 get vdom ,其实非常简单，因为 Component 它的内容是由 render 决定的，所以说
 我们就调一个 this.render().vdom;  实际上这是一个递归的调用，如果 render 还是一个 Component 的话，那么它还会调到
 Component 的 vdom ，如果一直到它是 ElementWrapper 的时候，那么它就不是了，
    好，接下来我们到 main.js 里面去看一个，我们这里不做 render 了，
 **/
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
 执行完了之后，这颗 DOM 树变成了一个我们想要的虚拟DOM 树，
 好，到这一步为止，我们已经完成了虚拟DOM树的构建。  在后面的课程中，我们将会继续把这颗虚拟DOM 树变成实体 DOM 树，然后我们再考虑，
 如何从一个已有的虚拟DOM树和已有的实体DOM树之间，我们生成一个 patch 的逻辑。
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









