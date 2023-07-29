import { Reducer, useMemo, useReducer } from "react";

export type Action = {
  payload: unknown[];
  type: string;
};

export type CreateMethods<TRecord extends ActionRecord, TState> = (
  state: TState,
) => TRecord;

export type ActionRecord<TState = any> = Record<
  Action["type"],
  (...args: any[]) => TState
>;

export type WrappedMethods<TRecord extends ActionRecord> = {
  [key in keyof TRecord]: (...payload: Parameters<TRecord[key]>) => void;
};

export default function useMethods<
  TRecord extends ActionRecord<TState>,
  TState,
>(
  createMethods: CreateMethods<TRecord, TState>,
  initialState: TState,
): [TState, WrappedMethods<TRecord>] {
  const reducer = useMemo<Reducer<TState, Action>>(
    () => (reducerState: TState, action: Action) => {
      return createMethods(reducerState)[action.type](...action.payload);
    },
    [createMethods],
  );

  const [state, dispatch] = useReducer<Reducer<TState, Action>>(
    reducer,
    initialState,
  );

  const wrappedMethods: WrappedMethods<TRecord> = useMemo(() => {
    const actionTypes = Object.keys(
      createMethods(initialState),
    ) as (keyof TRecord)[];
    const response = {} as WrappedMethods<TRecord>;
    for (const type of actionTypes) {
      response[type] = (...payload) =>
        dispatch({ payload, type: type as string });
    }
    return response;
  }, [createMethods, initialState]);

  return [state, wrappedMethods];
}
