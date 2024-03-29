import { Observable } from "rxjs";
import {
  Collection,
  Record as RecordI,
  Seq,
  ValueObject,
  Map,
  RecordOf,
} from "immutable";

export type Any = {
  [K: string]: any;
};

type PluginInitiator = (r?: RxStore<Any> & Subscribable<Any>) => void;
type ValueInitiator<R = any> = () => R;
export type Initiator<R = any> = PluginInitiator | ValueInitiator<R>;

export type BS = {
  [k: string]: Initiator;
};

export type ImmutableBase =
  | Collection<any, any>
  | Collection.Indexed<any>
  | Collection.Keyed<any, any>
  | Collection.Set<any>
  | RecordI.Factory<any>
  | Seq<any, any>
  | Seq.Indexed<any>
  | Seq.Keyed<any, any>
  | Seq.Set<any>
  | ValueObject
  | number
  | string
  | null
  | bigint
  | boolean;

export interface IBS extends BS {
  [k: string]: Initiator<ImmutableBase>;
}

export type CloneFunction<T> = (input: T) => T;

export type CloneFunctionMap<S extends BS> = Partial<{
  [K in keyof S]: CloneFunction<ReturnType<S[K]>>;
}>;

export type Comparator<T> = (prev: T, next: T) => boolean;

export type ComparatorMap<S extends BS> = Partial<{
  [K in keyof S]: Comparator<ReturnType<S[K]>>;
}>;

export type ConstraintKeys<L> = Readonly<L[]>

export interface Reactive<S extends BS> {
  get: <K extends keyof S>(key: K) => ReturnType<S[K]>;

  reset: <K extends keyof S>(key: K) => void;

  resetMultiple: <KS extends keyof S>(keys: ConstraintKeys<KS>) => void;

  resetAll: () => void;

  set: <KS extends keyof S>(updated: { [K in KS]: ReturnType<S[K]> }) => void;

  source: () => Observable<{ [K in keyof S]: ReturnType<S[K]> }>;

  getDefault: <K extends keyof S>(key: K) => ReturnType<S[K]>;

  getMultiple: <KS extends keyof S>(
    keys: ConstraintKeys<KS>
  ) => { [K in KS]: ReturnType<S[K]> };

  getAll: () => { [K in keyof S]: ReturnType<S[K]> };

  getAllKeys: () => Array<keyof S>;

  getDefaults<KS extends keyof S>(
    keys: ConstraintKeys<KS>
  ): { [k in KS]: ReturnType<S[k]> };

  getDefaultAll: () => { [k in keyof S]: ReturnType<S[k]> };
}

export type Unobserve = () => void;

export type Subscribable<S extends BS> = {
  observe: <K extends keyof S>(
    key: K,
    observer: (result: ReturnType<S[K]>) => void,
    comparator?: Comparator<ReturnType<S[K]>>
  ) => Unobserve;

  observeMultiple: <KS extends keyof S>(
    keys: ConstraintKeys<KS>,
    observer: (result: { [K in KS]: ReturnType<S[K]> }) => void,
    comparator?: Comparator<{ [K in KS]: ReturnType<S[K]> }>
  ) => Unobserve;

  observeAll: (
    observer: (result: { [K in keyof S]: ReturnType<S[K]> }) => void,
    comparator?: Comparator<{ [K in keyof S]: ReturnType<S[K]> }>
  ) => Unobserve;
};

export type ReactiveConfig = {
  fireOnCreate?: boolean;
  schedule?: "sync" | "async";
};

export interface Connectivity<S extends BS>
  extends Reactive<S>,
    Subscribable<S> {}

export type Action<P, T> = {
  type: T;
  payload?: P;
};

export type Reducer<T, S extends BS, K extends keyof S> = (
  state: ReturnType<S[K]>,
  action: Action<ReturnType<S[K]>, T>
) => ReturnType<S[K]>;

export type AsyncReducer<T, S extends BS, K extends keyof S> = (
  state: ReturnType<S[K]>,
  action: Action<ReturnType<S[K]>, T>
) => Promise<ReturnType<S[K]>> | Observable<ReturnType<S[K]>>;

export type Dispatch<P, T> = (action: Action<P, T>) => void;

export type AsyncDispatchConfig<S extends BS, K extends keyof S> = {
  start?: () => void;
  success?: (r: ReturnType<S[K]>) => void;
  fail?: (error: unknown, fallback: ReturnType<S[K]>) => void;
  fallback?: () => ReturnType<S[K]>;
  always?: () => void;
  lazy?: boolean;
};

export type AsyncDispatch<T, S extends BS, K extends keyof S> = (
  action: Action<ReturnType<S[K]>, T>,
  config?: AsyncDispatchConfig<S, K>
) => Promise<void>;

export interface Dispatcher<P, T> {
  dispatch: Dispatch<P, T>;
}

export interface AsyncDispatcher<T, S extends BS, K extends keyof S> {
  dispatch: AsyncDispatch<T, S, K>;
  observe: Observe<ReturnType<S[K]>>;
}

export type Computation<R, S extends BS> = (states: {
  [K in keyof S]: ReturnType<S[K]>;
}) => R;

export type ComputationAsync<R, S extends BS> = (states: {
  [K in keyof S]: ReturnType<S[K]>;
}) => Promise<R> | Observable<R>;

export interface Computed<R, S extends BS> {
  readonly computation: Computation<R, S>;
  get: () => R;
  observe: (observer: (r: R) => void) => Unobserve;
}

export type AsyncResponse<R> =
  | { success: true; result: R }
  | { success: false; cause: any };

export enum AsyncStates {
  FULFILLED,
  ERROR,
  PENDING,
}

export type AsyncGet<R> = {
  state: AsyncStates;
  value?: R;
};

export interface ComputedAsync<R, S extends BS> {
  readonly computation: ComputationAsync<R, S>;
  get: () => AsyncGet<R>;
  observe: (
    observer: (r: AsyncResponse<R>) => void,
    onPending?: Function
  ) => Unobserve;
}

export type AsyncComputeConfig<S extends BS, R> = {
  lazy?: boolean;
  onStart?: (val: { [K in keyof S]: ReturnType<S[K]> }) => void;
  onError?: (err: any) => void;
  onSuccess?: (result: R) => void;
  onComplete?: () => void;
};

export type Observer<T> = (val: T) => void;

export type Observe<T> = (observer?: Observer<T>) => Unobserve;

export interface RxStore<S extends BS> {
  comparator: Comparator<any>;
  setState: <KS extends keyof S>(
    updated:
      | {
          [K in KS]: ReturnType<S[K]>;
        }
      | (<KS extends keyof S>(prevAll: {
          [K in KS]: ReturnType<S[K]>;
        }) => Partial<{
          [K in keyof S]: ReturnType<S[K]>;
        }>)
  ) => this;
  reset: <K extends keyof S>(key: K) => this;
  resetMultiple: <KS extends keyof S>(keys: ConstraintKeys<KS>) => this;
  resetAll: () => this;
  getState: <K extends keyof S>(key: K) => ReturnType<S[K]>;
  getDataSource: () => Observable<{ [K in keyof S]: ReturnType<S[K]> }>;
  getSingleSource: <K extends keyof S>(key: K) => Observable<ReturnType<S[K]>>;
  getComparatorMap: () => ComparatorMap<S> | undefined;
  createDispatch: <K extends keyof S, T extends string>(params: {
    reducer: Reducer<T, S, K>;
    key: K;
  }) => Dispatch<ReturnType<S[K]>, T>;
  createAsyncDispatch: <K extends keyof S, T extends string>(params: {
    reducer: AsyncReducer<T, S, K>;
    key: K;
    config?: AsyncDispatchConfig<S, K>;
  }) => [AsyncDispatch<T, S, K>, Observe<ReturnType<S[K]>>];
  withComputation: <R>(params: {
    computation: Computation<R, S>;
    comparator?: Comparator<{ [K in keyof S]: ReturnType<S[K]> }>;
  }) => Computed<R, S>;
  withAsyncComputation: <R>(
    params: {
      computation: ComputationAsync<R, S>;
      comparator?: Comparator<{ [K in keyof S]: ReturnType<S[K]> }>;
    } & AsyncComputeConfig<S, R>
  ) => ComputedAsync<R, S>;
  getDefault<K extends keyof S>(key: K): ReturnType<S[K]>;
}

export interface RxNStore<S extends BS> extends RxStore<S> {
  getClonedState: <K extends keyof S>(key: K) => ReturnType<S[K]>;
  getImmutableState: <K extends keyof S>(
    key: K
  ) =>
    | {
        success: true;
        immutable: Collection<
          keyof ReturnType<S[K]>,
          ReturnType<S[K]>[keyof ReturnType<S[K]>]
        >;
      }
    | {
        success: false;
        immutable: ReturnType<S[K]>;
      };
  getStateAll: () => { [K in keyof S]: ReturnType<S[K]> };
  getStates: <KS extends keyof S>(
    keys: ConstraintKeys<KS>
  ) => { [K in KS]: ReturnType<S[K]> };
  getDefaults<KS extends keyof S>(
    keys: ConstraintKeys<KS>
  ): { [k in KS]: ReturnType<S[k]> };
  getDefaultAll(): { [k in keyof S]: ReturnType<S[k]> };
  getCloneFunctionMap: () => ComparatorMap<S>;
  cloneFunction?: CloneFunction<ReturnType<S[keyof S]>>;
}

export type NRSConfig<S extends BS> = {
  cloneFunction: CloneFunction<any>;
  cloneFunctionMap: CloneFunctionMap<S>;
  comparator: Comparator<any>;
  comparatorMap: ComparatorMap<S>;
  config: ReactiveConfig;
};

export interface RxImStore<IS extends IBS> extends RxStore<IS> {
  getStateAll: () => RecordOf<{ [K in keyof IS]: ReturnType<IS[K]> }>;
  getStates: <KS extends keyof IS>(
    keys: ConstraintKeys<KS>
  ) => RecordOf<{ [K in KS]: ReturnType<IS[K]> }>;
  getDefaults<KS extends keyof IS>(
    keys: ConstraintKeys<KS>
  ): RecordOf<{ [K in KS]: ReturnType<IS[K]> }>;
  getDefaultAll(): RecordOf<{ [K in keyof IS]: ReturnType<IS[K]> }>;
}

export interface Plugin<K extends string, R = any> {
  selector: () => K;
  chain: <P extends Plugin<string>[]>(...plugins: P) => this;
  initiator: Initiator<R>;
}

export abstract class PluginImpl<K extends string, R = any>
  implements Plugin<K, R>
{
  protected connector?: RxStore<Any> & Subscribable<Any>;
  constructor(protected id: K) {}

  private reportNoneConnectedError() {
    throw Error("initiator method is not called");
  }

  protected safeExecute<R>(
    callback: (connector: RxStore<Any> & Subscribable<Any>) => R
  ) {
    const connector = this.connector as RxStore<Any> & Subscribable<Any>;
    if (connector) {
      return callback(connector);
    }
    this.reportNoneConnectedError();
  }

  chain<P extends Plugin<string, any>[]>(...plugins: P) {
    this.safeExecute((connector) => {
      Array.from(plugins).forEach((plugin) => {
        plugin.initiator(connector);
      });
    });

    return this;
  }

  selector = () => this.id;

  abstract initiator: Initiator<R>;
}
