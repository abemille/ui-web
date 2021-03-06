import {apiAuthority, resourcesRoot} from '../config';
import {getByConclusion, ArgumentFromConclusion} from '../api-clients/arguments';
import {Request, Response} from 'express';
import {query, validationResult} from 'express-validator/check';

const paramValidation = [
  query('conclusion').exists().isString(),
];

function handler(req: Request, res: Response): void {
  const conclusion = req.query.conclusion;
  if (!validationResult(req).isEmpty()) {
    res.status(400).contentType('text/plain').send(`request missing required query parameter: conclusion`);
    return;
  }

  getByConclusion(conclusion).then((args: ArgumentFromConclusion[]) => {
    if (args.length > 1) {
      res.contentType('text/html').render('all-arguments', {
        resourcesRoot,
        apiAuthority,
        args,
        conclusion,
      });
    } else if (args.length === 1) {
      res.contentType('text/html').render('argument', {
        resourcesRoot,
        apiAuthority,
        id: args[0].id,
        argument: args[0],
      });
    } else {
      res.contentType('text/html').render('new-argument', {
        fromSearch: true,
        resourcesRoot,
        apiAuthority,
        conclusion: conclusion,
      });
    }
  }).catch((err) => {
    res.status(503).contentType('text/plain').send(`Failed fetch from arguments service.`);
  });
}

export default [
  ...paramValidation,
  handler,
];
