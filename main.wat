(module
  (import "coolio" "log2" (func $log (param i32) (param i32)))

  (memory (export "memory") 1)

  (func (export "helloWorld") (result i32)
    (i32.const 42)
  )

  (func $setSize (export "setSize")
    (param $xSize i32) (param $ySize i32)
    (i32.store
      (i32.const 0)
      (local.get $xSize)
    )
    (i32.store
      (i32.const 4)
      (local.get $ySize)
    )
  )
  (func $main
    (call $setSize (i32.const 52) (i32.const 52))
  )
  (start $main)

  (func $getX (export "getX") (result i32)(i32.load (i32.const 0)))
  (func $getY (export "getY") (result i32)(i32.load (i32.const 4)))

  (func $offsetFromCoordinate (export "offsetFromCoordinate")
    (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.mul
        (i32.add
          (i32.mul
            (call $getX)
            (local.get $y)
          )
          (local.get $x)
        )
        (i32.const 4)
      )
      (i32.const 8)
    )
  )

  (func $setCell (export "setCell") (param $x i32) (param $y i32) (param $value i32) (result i32)
      (call $inGrid (local.get $x) (local.get $y))
      (if (result i32)
      (then
        (i32.store
          (call $offsetFromCoordinate
            (local.get $x)
            (local.get $y)
          )
          (local.get $value)
        )
        (i32.const 1)
      )
      (else
        (i32.const 0)
      )
    )
  )

  (func $getCell (export "getCell") (param $x i32) (param $y i32) (result i32)
      (call $inGrid (local.get $x) (local.get $y))
      (if (result i32)
      (then
        (i32.load
          (call $offsetFromCoordinate
            (local.get $x)
            (local.get $y))
        )
      )
      (else
        (i32.const 0)
      )
    )  
  )

  (func $inGrid (param $x i32) (param $y i32) (result i32)
    (i32.and
      (i32.and
        (i32.ge_s (local.get $x) (i32.const 0))
        (i32.lt_s (local.get $x) (call $getX))
      )  
      (i32.and
        (i32.ge_s (local.get $y) (i32.const 0))
        (i32.lt_s (local.get $y) (i32.load (i32.const 4)))
      )
    )
  )

  (func $isCellAlive (param $x i32) (param $y i32) (result i32)
    (i32.and
      (call $getCell
        (local.get $x)
        (local.get $y)
      )
      (i32.const 1)
    )
  )

  (func $liveNeighbourCount (export "liveNeighbourCount")
    (param $x i32) (param $y i32) (result i32)
    (i32.add
      (i32.add
        (call $isCellAlive (i32.add (local.get $x) (i32.const -1)) (i32.add (local.get $y) (i32.const -1)))
        (i32.add
          (call $isCellAlive (local.get $x) (i32.add (local.get $y) (i32.const -1)))
          (call $isCellAlive (i32.add (local.get $x) (i32.const 1)) (i32.add (local.get $y) (i32.const -1)))
        )
      )
      (i32.add
        (i32.add
          (call $isCellAlive (i32.add (local.get $x) (i32.const -1)) (local.get $y))
          (call $isCellAlive (i32.add (local.get $x) (i32.const 1)) (local.get $y))
        )
        (i32.add
          (call $isCellAlive (i32.add (local.get $x) (i32.const -1)) (i32.add (local.get $y) (i32.const 1)))
          (i32.add
            (call $isCellAlive (local.get $x) (i32.add (local.get $y) (i32.const 1)))
            (call $isCellAlive (i32.add (local.get $x) (i32.const 1)) (i32.add (local.get $y) (i32.const 1)))
          )
        )
      )
    )
  )

  (func $setCellStateForNextGeneration (export "setCellStateForNextGeneration")
    (param $x i32) (param $y i32) (param $value i32) (result i32)
    (call $setCell
      (local.get $x)
      (local.get $y)
      (i32.or
        (call $isCellAlive
          (local.get $x)
          (local.get $y)
        )
        (i32.shl
          (local.get $value)
          (i32.const 1)
        )
      )
    )
  )

  (func $evolveCellToNextGeneration (export "evolveCellToNextGeneration")
    (param $x i32) (param $y i32) (result i32)
    (call $setCellStateForNextGeneration
      (local.get $x)
      (local.get $y)
      ;; Equal to 3 off course ^^ go figure
      (i32.eq
        (i32.or
          (i32.and
            (call $liveNeighbourCount (local.get $x) (local.get $y))
            (i32.const 3)
          )
          (i32.add
            (i32.and
              (call $liveNeighbourCount (local.get $x) (local.get $y))
              (i32.const 2)
            )
            (call $isCellAlive (local.get $x) (local.get $y))
          )
        )
        (i32.const 3)
      )
    )
  )

  (func $increment (param $value i32) (result i32)
    (i32.add 
      (local.get $value)
      (i32.const 1)
    )
  )

  (func $evolveAllCells
    (local $x i32)
    (local $y i32)

    (local.set $y (i32.const 0))
    
    (block 
      (loop 

        (local.set $x (i32.const 0))

        (block 
          (loop 
            ;; (call $log
            ;;   (local.get $x)
            ;;   (local.get $y)
            ;; )
            (call $evolveCellToNextGeneration
              (local.get $x)
              (local.get $y)
            )
            (local.set $x (call $increment (local.get $x)))
            (br_if 1 (i32.eq (local.get $x) (call $getX)))
            (br 0)
          )
        )
        
        (local.set $y (call $increment (local.get $y)))
        (br_if 1 (i32.eq (local.get $y) (i32.load (i32.const 4))))
        (br 0)
      )
    )
  )

  (func $promoteNextGeneration
    (local $x i32)
    (local $y i32)

    (local.set $y (i32.const 0))
    
    (block 
      (loop 

        (local.set $x (i32.const 0))

        (block 
          (loop
            (call $setCell
              (local.get $x)
              (local.get $y)
              (i32.shr_u
                (call $getCell
                  (local.get $x)
                  (local.get $y)
                )
                (i32.const 1)
              )
            )

            (local.set $x (call $increment (local.get $x)))
            (br_if 1 (i32.eq (local.get $x) (call $getX)))
            (br 0)
          )
        )
        
        (local.set $y (call $increment (local.get $y)))
        (br_if 1 (i32.eq (local.get $y) (i32.load (i32.const 4))))
        (br 0)
      )
    )
  )

  (func $tick (export "tick")
    (call $evolveAllCells)
    (call $promoteNextGeneration)
  )
)
