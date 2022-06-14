/* eslint-disable quotes */
/* eslint-disable indent */
/* eslint-disable import/no-duplicates */
/* eslint-disable object-curly-spacing */
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp();
import { EventContext, Change } from 'firebase-functions';
import * as firebase from 'firebase-admin';
const db = admin.firestore();

// On image writes, sets a position.
export const positioningFunction = functions.firestore
  .document('projects/{projectId}/images/{imageId}')
  .onWrite(
    (
      change: Change<firebase.firestore.DocumentSnapshot>,
      context: EventContext
    ) => {
      const projectId: string = context.params.projectId;
      const imageId: string = context.params.imageId;

      const projectRef: firebase.firestore.DocumentReference = db
        .collection('projects')
        .doc(projectId);
      if (!change.before.exists) {
        const imageRef = projectRef.collection('images').doc(imageId);

        return db.runTransaction(
          async (transaction: firebase.firestore.Transaction) => {
            const project = (await transaction.get(projectRef)).data();

            let position = project?.imageCount;

            if (!position) {
              position = 0;
            }

            transaction.update(projectRef, {
              imageCount: position + 1,
            });

            transaction.set(
              imageRef,
              {
                position,
              },
              { merge: true }
            );
          }
        );
      } else {
        return 0;
      }
    }
  );
