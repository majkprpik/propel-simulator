import { createPostbackConfigRoutes } from '../../../../shared/utils/postback-config-factory';
import { getDb } from '../index';

export const postbackConfigRoutes = createPostbackConfigRoutes('newsbreak', getDb);
