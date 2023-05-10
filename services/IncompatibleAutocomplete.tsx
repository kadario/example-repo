// ** React Imports
import { useEffect, useState, Fragment } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Imports
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

// ** Third Party Imports
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Store Imports
import { useDispatch } from 'react-redux'
import { incompatibleServicesAction } from 'src/store/index'

let typingTimer: any = null

const IncompatibleAutocomplete = () => {
  const [options, setOptions] = useState<any>([])
  const [loader, setLoader] = useState<boolean>(false)
  const [searchWord, setSearchWord] = useState<string>('')
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true)
  const [disabledInput, setDisabledInput] = useState<boolean>(false)
  const [incompatibleNew, setIncompatibleNew] = useState<any>(null)
  const { logout } = useAuth()
  const dispatcher = useDispatch()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleChange = (event: any, value: string) => {
    if (event?.type == 'change' && value.length > 3) {
      if (typingTimer !== null) {
        clearTimeout(typingTimer)
      }

      typingTimer = setTimeout(() => {
        setSearchWord(value)
        setLoader(true)
      }, 1000)
    }

    if (value.length === 0) {
      if (typingTimer !== null) {
        clearTimeout(typingTimer)
      }

      setSearchWord('')
      setLoader(false)
      setOptions([])
    }
  }

  const addNewIncompatible = () => {
    if (incompatibleNew !== null) {
      dispatcher(incompatibleServicesAction.addNewIncompatibleData(incompatibleNew))
      setDisabledBtn(true)
      setDisabledInput(true)
    }
  }

  useEffect(() => {
    if (loader && searchWord.length > 3) {
      axios
        .get(api.url + `/proxy/references/services/?search=${searchWord}&limit=15&page=1`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-type': 'application/json'
          }
        })
        .then(response => {
          setOptions(response.data.data.data)
          setLoader(false)
        })
        .catch(error => {
          if (error.response.status == 401) {
            logout()
          } else {
            setLoader(false)
          }
        })
    }
  }, [loader])

  return (
    <Box sx={{ display: 'flex', mb: 4 }}>
      <Autocomplete
        sx={{ flex: '1 1 auto' }}
        filterOptions={x => x}
        options={options}
        loading={loader}
        disabled={disabledInput}
        loadingText='Загрузка...'
        noOptionsText='Нет данных для отображения'
        isOptionEqualToValue={(option: any, value: any) => option.id === value.id}
        getOptionLabel={(option: any) => option.code + ' ' + option.name}
        onInputChange={(event, value) => handleChange(event, value)}
        onChange={(event, value) => {
          if (value?.id) {
            setDisabledBtn(false)
            setIncompatibleNew({ id: value.id, code: value.code, name: value.name })
          }
        }}
        renderOption={(props, option) => (
          <li {...props} key={option.id}>
            {option.code} {option.name}
          </li>
        )}
        renderInput={params => (
          <TextField
            {...params}
            label='Введите код услуги для поиска'
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <Fragment>
                  {loader ? <CircularProgress color='inherit' size={20} /> : null}
                  {params.InputProps.endAdornment}
                </Fragment>
              )
            }}
          />
        )}
      />
      <Button variant='contained' disabled={disabledBtn} onClick={() => addNewIncompatible()} sx={{ ml: 4 }}>
        Добавить
      </Button>
    </Box>
  )
}

export default IncompatibleAutocomplete
