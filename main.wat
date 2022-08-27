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

  (func (export "setCell") (param $x i32) (param $y i32) (param $value i32)
    (i32.store
      (call $offsetFromCoordinate
        (local.get $x)
        (local.get $y)
      )
      (local.get $value)
    )
  )

  (func (export "getCell") (param $x i32) (param $y i32) (result i32)
    (i32.load
      (call $offsetFromCoordinate
        (local.get $x)
        (local.get $y)
      )
    )
  )
  (export "offsetFromCoordinate" (func $offsetFromCoordinate))
)
