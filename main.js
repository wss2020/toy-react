import {createElement,Component,render} from "./toy-react.js";

class Mycomponent extends Component{
    constructor(){
        super();
        this.state ={
            a:1,
            b:2
        }
    }
    render(){
        return <div>
              <h1>my component sss</h1>

            // 但是我们的API 还跟 React 不一样，
            // 我们看这里的API,
            // 真正的react,this.state.a ++; this.rerender(); 其实是合成一句的。
            // 它就是一个 setState，那么setState 跟我们相比，它有两个不同的点。
            // 一个是setState 它能够实现这种对象的合并，它会把这个旧的state跟新的state，给它合并起来。
                  // 它不会把旧的完全地替换掉，而我们的这个是一种手工操作。
            // 另一个呢，它这个rerender是不需要去手工的去调用的，当然还有一些其它的细节，我们暂且不管。

             <button onclick={()=>{ this.state.a ++; this.rerender(); }}>add</button>

              <span> {this.state.a.toString()} </span>

        </div>
    }
}


render(
        <Mycomponent  id='a'  class='c' >
             <div>111</div>
             <div>222</div>
             <div>333</div>
             <div>444</div>

        </Mycomponent>
,document.body);



