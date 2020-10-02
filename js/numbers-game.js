class NumbersGame {
    constructor(algebra, state) {
        this.matrix = cartanMatrix(algebra);
        this.state = state;
    }

    fireNode(firedIdx) {
        var firedPopulation = this.state[firedIdx];
        if (firedPopulation >= 0) {
            return;
        }
        var nextState = Array.from(this.state, (x, toIdx) => (x - this.matrix[firedIdx][toIdx] * firedPopulation));

        this.state = nextState;
    }
}

function numbersGame(algebra, state, container) {
    var game = new NumbersGame(algebra, state);

    var graphData = matrixToGraph(game.matrix);
    var network = new vis.Network(container, graphData, {});

    network.on("click", function (params) {
        if (params.nodes.length > 0) {
            game.fireNode(params.nodes[0]);
            console.log(params.nodes[0], game.state);

        }
    });

    return network;
}

function matrixToGraph(matrix) {
    var nodes = Array.from(matrix, (x, i) => ({id: i, label: "Node " + i, population: null}));
    var edges = [];
    for (var from = 0; from < matrix.length; from++) {
        for (var to = from; to < matrix[from].length; to++ ) {
            var entry = matrix[from][to];
            var transpose_entry = matrix[to][from];

            // We can be assured that these will always be both zero or both negative for
            // Cartan matrices, but it doesn't hurt to make absolutely sure
            if (entry < 0 && transpose_entry < 0) {
                edges.push({from: from, to: to, amplitude: -1 * entry, reverseAmplitude: -1 * transpose_entry});
            }
        }
    }
    var graphData = {nodes: nodes, edges: edges};
    return graphData;
}

function tridiagonalMatrix(rank, coeffs) {
    // Generate a grid of size `rank`.
    var matrix = [...Array(rank)].map(e => Array(rank).fill(0));

    var [upper, middle, lower] = coeffs;

    for (var i = 0; i < rank; i++) {
        if (i - 1 >= 0) { matrix[i][i - 1] = lower; }
        matrix[i][i] = middle;
        if (i + 1 < rank) { matrix[i][i + 1] = upper; }
    }

    return matrix;
}

function parseLieAlgebra(algebra) {
    // Return if `algebra` corresponds to a Cartan matrix.
    // TODO: Should we bother to handle the exceptional overlaps? (E3, etc.)
   
    const regex = /([ABCDEFG])(\d+)/i;

    const groups = regex.exec(algebra);

    var valid = false;
    if (groups !== null) {
        var type = groups[1];
        var rank = Number(groups[2]);

        switch (type) {
        case "A":
            valid = (rank >= 1);
            break;
        case "B":
            valid = (rank >= 2);
            break;
        case "C":
            valid = (rank >= 3);
            break;
        case "D":
            valid = (rank >= 4);
            break;
        case "E":
            valid = (6 <= rank <= 8);
            break;
        case "F":
            valid = (rank == 4);
            break;
        case "G":
            valid = (rank == 2);
            break;
        }
    }
    if (valid) {
        return [type, rank];
    } else {
        throw "invalid algebra: " + algebra;
    }
}

function cartanMatrix(algebra) {
    // Return the Cartan matrix corresponding to the given string as an array of arrays.
    // Cf. Humphreys page 59.

    var [type, rank] = parseLieAlgebra(algebra);

    var matrix = tridiagonalMatrix(rank, [-1, 2, -1]);
    switch (type) {
    case "A":
        break;
    case "B":
        matrix[rank - 2][rank - 1] = -2;
        break;
    case "C":
        matrix[rank - 1][rank - 2] = -2;
        break;
    case "D":
        matrix[rank - 3][rank - 1] = -1;
        matrix[rank - 2][rank - 1] = 0;
        matrix[rank - 1][rank - 2] = 0;
        matrix[rank - 1][rank - 3] = -1;
        break;
    case "E":
        matrix[0][1] = 0;
        matrix[0][2] = -1;
        matrix[1][0] = 0;
        matrix[1][2] = 0
        matrix[1][3] = -1;
        matrix[2][0] = -1;
        matrix[2][1] = 0;
        matrix[3][1] = -1;
        break;
    case "F":
        matrix[1][2] = -2;
        break;
    case "G":
        matrix[1][0] = -3;
        break;
    }

    return matrix;
}
