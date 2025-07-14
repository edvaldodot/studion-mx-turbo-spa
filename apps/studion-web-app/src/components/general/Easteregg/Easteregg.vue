<script type="module">
import Action from '../Action'

const UP = [-1, 0]
const DOWN = [1, 0]
const LEFT = [0, -1]
const RIGHT = [0, 1]

let keyMap = {
  37: LEFT,
  38: UP,
  39: RIGHT,
  40: DOWN,
}

export default {
  name: 'easteregg',
  components: {
    Action,
  },
  data() {
    return {
      direction: UP,
      dead: false,
      grid: null,
      snakePos: null,
      length: null,
      snakeCells: null,
      ticking: null,
      userActions: [],
    }
  },
  created() {
    this.start()
    window.addEventListener('keydown', (event) => this.handleUserAction(event.which))
  },
  methods: {
    createGrid(size, valueFn) {
      this.grid = []
      for (var i = 0; i < size; i++) {
        this.grid[i] = []
        for (var j = 0; j < size; j++) {
          this.grid[i][j] = valueFn(i, j)
        }
      }
    },
    random(grid) {
      var x = Math.floor(Math.random() * grid.length)
      var y = Math.floor(Math.random() * grid[x].length)
      return grid[x][y]
    },
    handleUserAction(key) {
      let direction = keyMap[key]
      if (direction) {
        this.userActions.push(() => {
          if (direction[0] + this.direction[0] === 0 && direction[1] + this.direction[1] === 0) {
            return // ignore opposite direction presses
          }
          this.direction = direction
        })
      }
    },
    start() {
      let size = 40
      let ms = 65
      this.createGrid(size, (x, y) => ({ x, y, snake: 0, food: false }))
      this.dead = false
      this.userActions = []
      this.length = 5
      this.ticking = setInterval(this.tick, ms)

      this.snakePos = this.random(this.grid)
      this.snakePos.snake = this.length
      this.snakeCells = [this.snakePos]
      this.setFood()
    },
    tick() {
      let userAction
      // eslint-disable-next-line
      if ((userAction = this.userActions.shift())) {
        userAction()
      }
      this.moveSnake()
      this.eatFood()
    },
    moveSnake() {
      let { x, y } = this.snakePos
      let [xd, yd] = this.direction
      this.snakePos = (this.grid[x + xd] || [])[y + yd]

      if (!this.snakePos || this.snakePos.snake) {
        return this.gameOver()
      }

      // shift snake in all cells
      this.snakeCells.forEach((cell) => cell.snake--)
      this.snakeCells = this.snakeCells.filter((cell) => cell.snake > 0)

      this.snakePos.snake = this.length
      this.snakeCells.push(this.snakePos)
    },
    eatFood() {
      if (this.snakePos && this.snakePos.food) {
        this.length++
        this.snakeCells.forEach((cell) => cell.snake++)
        this.snakePos.food = false
        this.setFood()
      }
    },
    setFood() {
      this.random(this.grid).food = true
    },
    gameOver() {
      this.dead = true
      clearInterval(this.ticking)
    },
    leave() {
      this.$emit('leave')
    },
  },
}
</script>

<template>
  <div class="easteregg-container">
    <div class="easteregg-inner">
      <span class="easteregg-total">{{ length - 5 }}</span>
      <table class="easteregg-table">
        <tr
          v-for="(row, rowIndex) in grid"
          :key="`row-${rowIndex}`"
        >
          <td
            v-for="(cell, cellIndex) in row"
            class="grid-cell"
            :class="{ snake: cell.snake > 0, food: cell.food }"
            :key="`cell-${cellIndex}`"
          ></td>
        </tr>
      </table>

      <div class="easteregg-message">
        <template v-if="dead">
          <p class="text-color">{{ $t('easteregg.message') }}</p>
          <div class="easteregg-actions">
            <action
              type="button"
              secondary
              :text="$t('easteregg.restart')"
              @click="start"
            ></action>
            <span class="text-or">{{ $t('easteregg.or') }}</span>
            <action
              type="button"
              secondary
              :text="$t('easteregg.leave')"
              @click="leave"
            ></action>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Easteregg.scss';
</style>
