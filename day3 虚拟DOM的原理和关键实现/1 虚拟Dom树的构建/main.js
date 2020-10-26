import {createElement, Component, render} from "./toy-react.js";

/**
    我们前面两课，已经带着大家完成了一个，看起来非常像 React 的东西，但是现在版本的 toy-react ，有一个致命的
 问题，是因为它没有引入虚拟 Dom ,所以说每次都是全量地去更新它的整个的 Dom 树，在 React 的这种UI 等于数据加上
 一个模版的这样的一个思路下，那么如果我们不引入 Virtual Dom 话，那么我们就只能去全量更新它的 DOM 树，这个过程
 对性能的损耗，是非常的大的，哪怕我们只做一个非常小的这样的一个操作，最后一定会导致它有一个非常大规模的这样的Dom
 更新，这个对我们来说是不可接受的，所以说，我们也是要引入 VDOM ,让大家去体验一下 React 是怎么样去解决这个问题的，
 那么接下来，我们就来继续改造我们的 toy-react ,实现 VDOM .
 **/

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
/**
    好，接下来我们到 main.js 里面去看一个，我们这里不做 render 了，我们创建一个 game ,然后我们来把 game 的 vdom 取出来，
 看看它的vdom 是不是跟我们想象中的一样，  1.png 是打印出来的 dom 树，可以看到这个 div 是没有 children ，因为这个 toy-react
 里面，我们没有把 ElementWrapper、setAttribute 和 appendChild 干掉，我们必须把它干掉，这样它才能够调到原本的 Component 上
 的对应的两个方法，它才会有 children 和 Attribute ,那么这个时候，我们对 ElementWrapper ,实际上是 这个被删掉的代码，
 **/
//render(<Game/>, document.getElementById("root"));
let game = <Game/>;
console.log(game.vdom);


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
