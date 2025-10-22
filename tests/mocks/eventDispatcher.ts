import { IEventDispatcher, EventEnvelope } from '../../src/application/ports/messaging/IEventDispatcher';

export function createEventDispatcherMock() {
  const dispatchMock = jest.fn<Promise<void>, [EventEnvelope[]]>().mockResolvedValue(undefined);
  const dispatcher: IEventDispatcher = { dispatch: dispatchMock };
  return { dispatcher, dispatchMock };
}