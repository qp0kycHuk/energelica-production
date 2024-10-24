import phonemask from './phonemask/phonemask'
import ripple from '@qpokychuk/ripple'
import '../scss/index.scss'
import {
  Engine,
  Render,
  Bodies,
  Composite,
  Runner,
  Mouse,
  MouseConstraint,
  Events,
  Body,
  Composites,
  Constraint,
} from 'matter-js'

window.addEventListener('DOMContentLoaded', () => loadHandler())

function loadHandler() {
  ripple.init()
  phonemask.init('[type="tel"]')

  ripple.attach('.btn')
  ripple.attach('.waved')
  ripple.deAttach('.btn-text')

  scrollHandler()
  document.addEventListener('toggleopen', toggleOpenHandler)
  document.addEventListener('toggleclose', toggleCloseHandler)
}

window.addEventListener('load', matterinit)

window.addEventListener('scroll', scrollHandler)

function scrollHandler() {
  document.body.classList.toggle('scroll-top', window.scrollY == 0)
}

const menusIds = ['lk-menu', 'menu', 'catalog-filter']

function toggleOpenHandler(e: Event) {
  const event = e as CustomEvent

  if (menusIds.includes(event.detail.target.id)) {
    document.body.classList.add('menu-opened')
  }
}

function toggleCloseHandler(e: Event) {
  const event = e as CustomEvent

  if (menusIds.includes(event.detail.target.id)) {
    document.body.classList.remove('menu-opened')
  }
}

function matterinit() {
  const $el = document.body.querySelector<HTMLElement>('.main')

  if (!$el) return

  const percentX = (percent: number) => Math.round((percent / 100) * $el.clientWidth)
  const percentY = (percent: number) => Math.round((percent / 100) * $el.clientHeight)

  const engine = Engine.create()
  const runner = Runner.create()
  const world = engine.world
  const objects = []
  const { rectangle, circle } = Bodies
  const mouse = Mouse.create($el)
  const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
      stiffness: 0.2,
      render: {
        visible: false,
      },
    },
  })
  const render = Render.create({
    element: $el,
    engine: engine,
  })

  $el.addEventListener('pointerdown', () => Composite.add(world, mouseConstraint))
  document.addEventListener('pointercancel', pointerupHundler)
  document.addEventListener('pointerup', pointerupHundler)
  document.addEventListener('pointerleave', pointerupHundler)

  function pointerupHundler() {
    Mouse.clearSourceEvents(mouse)
    Composite.remove(world, mouseConstraint)
  }

  // bounds
  const BOUNDS_WIDTH = 400
  const boundsOptions = { isStatic: true, restitution: 0 }
  const wall = { height: percentY(150), y: percentY(25) }
  const floor = { width: percentX(120), x: percentX(50) }

  const ground = rectangle(floor.x, percentY(100) + BOUNDS_WIDTH / 2, floor.width, BOUNDS_WIDTH, boundsOptions)
  const сeiling = rectangle(floor.x, percentY(-50) - BOUNDS_WIDTH / 2, floor.width, BOUNDS_WIDTH, boundsOptions)
  const wallLeft = rectangle(0 - BOUNDS_WIDTH / 2, wall.y, BOUNDS_WIDTH, wall.height, boundsOptions)
  const wallRight = rectangle(percentX(100) + BOUNDS_WIDTH / 2, wall.y, BOUNDS_WIDTH, wall.height, boundsOptions)

  objects.push(ground, сeiling, wallLeft, wallRight)

  // objects
  const OBJECTS_GAP = 8
  const OBJECTS_ELASTIC = 0.25
  const $objectElements = Array.from($el.querySelectorAll<HTMLElement>('[data-object]'))
  const objectByEl = new Map<HTMLElement, Composite>()

  for (const $objectEl of $objectElements) {
    const rect = $objectEl.getBoundingClientRect()
    const { width, height } = rect
    const left = Math.abs($el.getBoundingClientRect().left - rect.left) + width / 2 - OBJECTS_GAP / 2
    const top = Math.abs($el.getBoundingClientRect().top - rect.top) + height / 2 - OBJECTS_GAP / 2

    const radius = Math.min(Math.min(width, height) + OBJECTS_GAP, parseFloat(getComputedStyle($objectEl).borderRadius))

    const COMPOSITES_CELLS = 2
    const COLS = COMPOSITES_CELLS
    const ROWS = COMPOSITES_CELLS
    const CELL_WIDTH = (width + OBJECTS_GAP) / COLS
    const CELL_HEIGHT = (height + OBJECTS_GAP) / ROWS
    const stack = Composites.stack(left, top, COLS, ROWS, 0, 0, (x: number, y: number) => {
      return rectangle(x, y, CELL_WIDTH, CELL_HEIGHT, {
        chamfer: {
          radius: radius / 2 / COMPOSITES_CELLS,
        },
      })
    })

    Composites.mesh(stack, COLS, ROWS, true, {})

    const constraint1 = Constraint.create({
      bodyA: stack.bodies[0],
      bodyB: stack.bodies[3],
      pointA: { x: 0.5 * CELL_WIDTH, y: 0.5 * CELL_HEIGHT },
      pointB: { x: -0.5 * CELL_WIDTH, y: -0.5 * CELL_HEIGHT },
    })
    const constraint2 = Constraint.create({
      bodyA: stack.bodies[1],
      bodyB: stack.bodies[2],
      pointA: { x: -0.5 * CELL_WIDTH, y: 0.5 * CELL_HEIGHT },
      pointB: { x: 0.5 * CELL_WIDTH, y: -0.5 * CELL_HEIGHT },
    })

    objectByEl.set($objectEl, stack)
    objects.push(stack)
    objects.push(constraint1)
    objects.push(constraint2)
  }

  function bindHtmlPosition() {
    for (const [$objectEl, object] of objectByEl.entries()) {
      $objectEl.style.position = 'absolute'
      $objectEl.style.left = '0'
      $objectEl.style.top = '0'
      $objectEl.style.transform = `translate3d(${getCompositePosition(object).x}px, ${
        getCompositePosition(object).y
      }px, 0) translate3d(-50%,-50%,0)  rotateZ(${getCompositePosition(object).angle}rad)`
    }
  }

  function getCompositePosition(composite: Composite) {
    const bodies = Composite.allBodies(composite)
    const result = bodies.reduce(
      (acc, current) => {
        acc.x += current.position.x
        acc.y += current.position.y
        acc.angle = Math.abs(current.angle) > Math.abs(acc.angle) ? current.angle : acc.angle

        return acc
      },
      { x: 0, y: 0, angle: 0 }
    )

    result.x /= bodies.length
    result.y /= bodies.length

    return result
  }

  Composite.add(world, objects)
  // Render.run(render)
  Runner.run(runner, engine)

  Events.on(runner, 'afterTick', bindHtmlPosition)
}
