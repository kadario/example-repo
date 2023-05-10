import { useEffect, useState } from 'react'

// ** MUI Components
import Chip from '@mui/material/Chip'
import Checkbox from '@mui/material/Checkbox'
import ListItemText from '@mui/material/ListItemText'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

const SelectChip = (props: any) => {
  const [selectedValues, setSelectedValues] = useState<Array<any>>([])
  const [valuesList, setValuesList] = useState<Array<any>>([])

  const handleChange = (event: any) => {
    setSelectedValues(event.target.value)
  }

  const handleDelete = (event: any, value: string) => {
    setSelectedValues((valuesList: any) => valuesList.filter((valueListItem: any) => valueListItem.id !== value))
  }

  useEffect(() => {
    if (selectedValues) props.updateSelectedValues(selectedValues)
  }, [selectedValues])

  useEffect(() => {
    // copy selected items from valuesList to let Select box have right comparison of objects
    const tmpSelectedValues: any[] = []

    props.selectedValuesList.forEach((itemList: any) => {
      tmpSelectedValues.push(props.valuesList.find((valueItem: any) => valueItem.id === itemList.id))
    })

    // set copied objects to selected values
    setSelectedValues(tmpSelectedValues)
    setValuesList(props.valuesList)
  }, [])

  return (
    <>
      <Select
        multiple
        onChange={handleChange}
        value={selectedValues}
        displayEmpty={true}
        renderValue={(selectedList: any) => (
          <>
            {selectedList.length > 0 ? (
              selectedList.map((selectedItem: any) => (
                <Chip
                  key={selectedItem.id}
                  label={selectedItem.name}
                  clickable
                  deleteIcon={<Icon icon='mdi:remove' onMouseDown={event => event.stopPropagation()} />}
                  onDelete={event => handleDelete(event, selectedItem.id)}
                  sx={{ mr: 2 }}
                />
              ))
            ) : (
              <>Выберите значение</>
            )}
          </>
        )}
      >
        {valuesList?.map((valueListItem: any) => (
          <MenuItem key={valueListItem.id} value={valueListItem}>
            <Checkbox
              checked={
                selectedValues.find(selectedItem => selectedItem.id == valueListItem.id) !== undefined ? true : false
              }
            />
            <ListItemText primary={valueListItem.name} />
          </MenuItem>
        ))}
      </Select>
    </>
  )
}

export default SelectChip
