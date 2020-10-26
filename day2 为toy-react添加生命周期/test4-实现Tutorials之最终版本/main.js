import {createElement, Component, render} from "./toy-react.js";

/**
    上个版本结束，range 的小 bug 结束了，但是我们用的 React 的版本，还没有交换 player 的逻辑，
 那么用一个它的最终版本的 Code .
    我们注意这个 Square ，它用了 function 模式，我们不支持这个 function 模式，所以我们要做一些
 修改，我们把它放进 main.js 里面，
    这个 Square 不支持，我们先格式化一下,然后我们要改成 class 的 API ,这个地方我们要套上一个 render
 函数，而这个props 要换成 this.props , 我们是 class based API, 所以就跟这个 this 是强相关的。
    然后所有的 React.Component 都改成 Component.
    React.render 的地方，给它去掉，render 的时候就是一个 render .

    重新 webpack ,没有经过任何的结构性的修改，只是我们故意把 API 设计得稍微现代一点，另外我们没有去实现
 这个 function 的 API ,这个 React 的 Tutorials 里面的代码，就已经能够完全地执行了，但是我们还需要注
 意一个问题，我们的代码里面，它的更新范围是非常大的，基本上发生了 root 级别的更新，而在 React 里面，我们
 可以看到，它的代码是非常的出色的， 点击可以看到，它基本上就只更新这个节点本身，它的更新的范围非常的小，所以
 说，React 的它的整个的虚拟Dom 的对比，能量就体现出来了，我们如果说想要去做一个跟 React 同样的水平，那是
 需要非常多的路要走的，但是我们在课程中，还是可以做一些简单的优化，把虚拟 Dom 引入进来，做到一个部分更新的这
 样的一个效果，下一节处理。
 **/

// function Square(props) {
class Square extends Component{
    render(){
        return (
            <button className="square" onClick={this.props.onClick}>
                {this.props.value}
            </button>
        );
    }
}

class Board extends Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        return (
            <div>
                <div className="board-row">
                    {this.renderSquare(0)}
                    {this.renderSquare(1)}
                    {this.renderSquare(2)}
                </div>
                <div className="board-row">
                    {this.renderSquare(3)}
                    {this.renderSquare(4)}
                    {this.renderSquare(5)}
                </div>
                <div className="board-row">
                    {this.renderSquare(6)}
                    {this.renderSquare(7)}
                    {this.renderSquare(8)}
                </div>
            </div>
        );
    }
}

class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [
                {
                    squares: Array(9).fill(null)
                }
            ],
            stepNumber: 0,
            xIsNext: true
        };
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? "X" : "O";
        this.setState({
            history: history.concat([
                {
                    squares: squares
                }
            ]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0
        });
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            const desc = move ?
                'Go to move #' + move :
                'Go to game start';
            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = "Winner: " + winner;
        } else {
            status = "Next player: " + (this.state.xIsNext ? "X" : "O");
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <ol>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

render(<Game/>, document.getElementById("root"));

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return squares[a];
        }
    }
    return null;
}
