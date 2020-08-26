import {createElement,render,Component} from "./toy-react";


class Mycomponent extends Component{
    render(){
        return <div>
        <h1>my component</h1>
        {this.children}
      </div>
    }
}




render(
<Mycomponent id="a" class="c" >
    <font>abc</font>
    <p>111</p>
    <span>222</span>
    </Mycomponent>
    ,document.body);

//
// render(
// <div id="a" class="c" >
//     <font class="div2">abcd</font>
//     <span class="span1">123</span>
//     <p  class="p1">wss</p>
//     </div>
//     ,document.body);

