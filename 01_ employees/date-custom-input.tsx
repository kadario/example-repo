import { forwardRef } from "react"

// ** MUI imports
import TextField from '@mui/material/TextField';

const DateCustomInput = forwardRef((props: any, ref: any) => {
  // ** Props
  const { label, readOnly } = props

  return (
    <TextField 
      inputRef={ref} 
      label={label || ''} 
      {...props} 
      {...(readOnly && { inputProps: { readOnly: true } })} 
    />
  )
})

export default DateCustomInput;