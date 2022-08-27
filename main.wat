(module
  (memory (export "memory") 1)

  (func (export "helloWorld") (result i32)
    (i32.const 42)
  )

  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
    (i32.mul
      (i32.add
        (i32.mul
          (i32.const 50)
          (local.get $y)
        )
        (local.get $x)
      )
      (i32.const 4)
    )
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))

  (func (export "setCell") (param $x i32) (param $y i32) (param $value i32) (result i32)
    (call $inGrid
      (local.get $x)
      (local.get $y)
    )
    ;; Use result of check to do if/else
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

  (func (export "getCell") (param $x i32) (param $y i32) (result i32)
      ;; ensure that both the x and y value are within range:
      (call $inGrid
        (local.get $x)
        (local.get $y)
      )
      ;; Use result of check to do if/else
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
        (i32.lt_s (local.get $x) (i32.const 50))
      )  
      (i32.and
        (i32.ge_s (local.get $y) (i32.const 0))
        (i32.lt_s (local.get $y) (i32.const 50))
      )
    )
  )
)
